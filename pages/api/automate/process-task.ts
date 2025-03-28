// @ts-nocheck
import { SupabaseWrapper } from "@/database/supabase";
import { NextApiRequest, NextApiResponse } from "next";
import { parseStringPromise } from "xml2js";
import OpenAI from "openai";

export const config = { maxDuration: 200 };

// make a sleep function
const sleep = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function fetchCategories(client) {
  const { data, error } = await client
    .from("categories")
    .select("*")
    .eq("paused", false)
    .order("last_ran_at", { ascending: true });
  return { categories: data || [], error };
}

function findCategoryToRun(categories) {
  const nowInSeconds = Date.now();

  for (const category of categories) {
    const lastRanAt = new Date(category.last_ran_at).getTime();
    console.log(
      "nowInSeconds",
      nowInSeconds,
      new Date(nowInSeconds).toLocaleString(),
    );
    console.log("lastRanAt", lastRanAt, new Date(lastRanAt).toLocaleString());
    let difference = (nowInSeconds - lastRanAt) / 1000;
    console.log("difference", difference);
    if (difference > category.schedule) {
      return category;
    }
  }
  return null;
}

async function updateCategoryLastRan(client, categoryId) {
  return client
    .from("categories")
    .update({ last_ran_at: new Date(), isRunning: true })
    .eq("id", categoryId);
}

async function updateCategoryIsRunning(client, categoryId, isRunning) {
  return client.from("categories").update({ isRunning }).eq("id", categoryId);
}

async function fetchRSSFeed(url) {
  const response = await fetch(url);
  return response.text();
}

async function generateAIContent(openai, prompt) {
  const completion = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    // store: true,
    messages: [{ role: "user", content: prompt }],
  });
  return completion.choices[0].message.content;
}

async function getGeneratedImage(prompt) {
  const response = await fetch("https://api.userapi.ai/midjourney/v2/imagine", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": "4a31c14d-2f9e-4661-9b72-fabe3186417c",
    },
    body: JSON.stringify({ prompt: prompt }),
  });
  const data = await response.json();
  let imagineHash = data?.hash || null;
  console.log("imagineHash", imagineHash);
  await sleep(40);

  // upscale
  const responseUpscale = await fetch(
    "https://api.userapi.ai/midjourney/v2/upscale",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": "4a31c14d-2f9e-4661-9b72-fabe3186417c",
      },
      body: JSON.stringify({ hash: imagineHash, choice: 1 }),
    },
  );
  const dataUpscale = await responseUpscale.json();
  console.log("dataUpscale", dataUpscale);
  let upscaleHash = dataUpscale?.hash || null;
  console.log("upscaleHash", upscaleHash);
  await sleep(40);

  // https://api.userapi.ai/midjourney/v2/status?hash=eb4c4381-bde5-44f9-b91f-a3953113af45 get request with api-key and content-type application/json

  const responseStatus = await fetch(
    `https://api.userapi.ai/midjourney/v2/status?hash=${upscaleHash}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "api-key": "4a31c14d-2f9e-4661-9b72-fabe3186417c",
      },
    },
  );
  console.log("responseStatus", responseStatus);
  const dataStatus = await responseStatus.json();
  console.log("dataStatus", dataStatus);
  let result = dataStatus?.result?.url || dataStatus?.result?.proxy_url || null;

  const description = await fetch(
    "https://api.userapi.ai/midjourney/v2/describe",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": "4a31c14d-2f9e-4661-9b72-fabe3186417c",
      },
      body: JSON.stringify({ url: result }),
    },
  );
  const descriptionData = await description.json();
  let descriptionHash = descriptionData?.hash || null;
  console.log("descriptionHash", descriptionHash);
  await sleep(40);

  const responseDescription = await fetch(
    `https://api.userapi.ai/midjourney/v2/status?hash=${descriptionHash}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "api-key": "4a31c14d-2f9e-4661-9b72-fabe3186417c",
      },
    },
  );

  const dataDescription = await responseDescription.json();
  console.log("dataDescription", dataDescription);
  let descriptionResult = dataDescription?.result
    ? dataDescription?.result[0]
    : "No description found";
  console.log("descriptionResult", descriptionResult);

  return {
    url: result,
    description: descriptionResult,
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ result: null, error: "Method Not Allowed" });
  }

  const database = new SupabaseWrapper("SERVER", req, res);
  const client = database.getClient();
  const { categories, error } = await fetchCategories(client);

  const categoryToRun = findCategoryToRun(categories);
  if (!categoryToRun || error) {
    return res.status(200).json({
      result: categories,
      error,
      CategoryToRun: null,
      text: "No category to run",
    });
  }

  await updateCategoryLastRan(client, categoryToRun.id);
  const feedData = await fetchRSSFeed(categoryToRun.rssFeedUrl);
  const jsonResult = await parseStringPromise(feedData);
  let feedTextContent = JSON.stringify(jsonResult, null, 2);
  feedTextContent = feedTextContent.split("pubDate")[0] || feedTextContent;

  if (categoryToRun.type === "normal") {
    try {
      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      });

      const feedSummaryByChatgpt = await generateAIContent(
        openai,
        `${categoryToRun.summaryPrompt} : "${feedTextContent}"`,
      );
      const captionByChatgpt = await generateAIContent(
        openai,
        `${categoryToRun.captionPrompt} : "{article summary : ${feedSummaryByChatgpt}}"`,
      );
      const imageTitle = await generateAIContent(
        openai,
        `${categoryToRun.imageTitlePrompt} : "${feedSummaryByChatgpt}"`,
      );
      const imageGenPrompt = await generateAIContent(
        openai,
        `${categoryToRun.imageGenPrompt} : "{article summary : ${feedSummaryByChatgpt}}"`,
      );

      const { url, description } = await getGeneratedImage(imageGenPrompt);

      const tagGenPrompt = await generateAIContent(
        openai,
        `${categoryToRun.tagPrompt} : "{image description : ${description}}"`,
      );

      // https://visualstream.vercel.app/api/add-image
      // POST
      // {
      //   caption,
      //   title,
      //   ai_describe,
      //   article_link,
      //   category,
      //   ai_tags,
      //   ai_article_describe,
      // }

      const addImageResponse = await fetch(
        "https://visualstream.vercel.app/api/add-image",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            caption: captionByChatgpt,
            title: imageTitle,
            ai_describe: description,
            article_link: categoryToRun.rssFeedUrl,
            category: categoryToRun.name,
            ai_tags: tagGenPrompt,
            ai_article_describe: feedSummaryByChatgpt,
          }),
        },
      );

      const addImageData = await addImageResponse.json();
      console.log("addImageData", addImageData);

      const id = addImageData?.result?.image_data?.id || null;
      const imageUrl = url;

      // https://visualstream.vercel.app/api/process-image-url
      // POST
      // {
      // image_url, id
      // }

      const processImageResponse = await fetch(
        "https://visualstream.vercel.app/api/process-image-url",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image_url: imageUrl,
            id,
          }),
        },
      );

      let processImageData = await processImageResponse.json();
      console.log("processImageData", processImageData);

      await updateCategoryIsRunning(client, categoryToRun.id, false);

      return res.status(200).json({
        categoryToRun,
        feedSummaryByChatgpt,
        captionByChatgpt,
        imageTitle,
        imageGenPrompt,
        generatedImage: url,
        generatedImageDescription: description,
        generatedTags: tagGenPrompt,
      });
    } catch (error) {
      return res.status(500).json({ result: null, error: error });
    }
  } else {
    try {
      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      });

      const feedSummaryByChatgpt = await generateAIContent(
        openai,
        `${categoryToRun.summaryPrompt}`,
      );
      const captionByChatgpt = await generateAIContent(
        openai,
        `${categoryToRun.captionPrompt} : "{article summary : ${feedSummaryByChatgpt}}"`,
      );
      const imageTitle = await generateAIContent(
        openai,
        `${categoryToRun.imageTitlePrompt} : "${feedSummaryByChatgpt}"`,
      );
      const imageGenPrompt = await generateAIContent(
        openai,
        `${categoryToRun.imageGenPrompt} : "{article summary : ${feedSummaryByChatgpt}}"`,
      );

      const { url, description } = await getGeneratedImage(imageGenPrompt);

      const tagGenPrompt = await generateAIContent(
        openai,
        `${categoryToRun.tagPrompt} : "{image description : ${description}}"`,
      );

      // https://visualstream.vercel.app/api/add-image
      // POST
      // {
      //   caption,
      //   title,
      //   ai_describe,
      //   article_link,
      //   category,
      //   ai_tags,
      //   ai_article_describe,
      // }

      const addImageResponse = await fetch(
        "https://visualstream.vercel.app/api/add-image",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            caption: captionByChatgpt,
            title: imageTitle,
            ai_describe: description,
            article_link: categoryToRun.rssFeedUrl,
            category: categoryToRun.name,
            ai_tags: tagGenPrompt,
            ai_article_describe: feedSummaryByChatgpt,
          }),
        },
      );

      const addImageData = await addImageResponse.json();
      console.log("addImageData", addImageData);

      const id = addImageData?.result?.image_data?.id || null;
      const imageUrl = url;

      // https://visualstream.vercel.app/api/process-image-url
      // POST
      // {
      // image_url, id
      // }

      const processImageResponse = await fetch(
        "https://visualstream.vercel.app/api/process-image-url",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image_url: imageUrl,
            id,
          }),
        },
      );

      let processImageData = await processImageResponse.json();
      console.log("processImageData", processImageData);

      await updateCategoryIsRunning(client, categoryToRun.id, false);

      return res.status(200).json({
        categoryToRun,
        feedSummaryByChatgpt,
        captionByChatgpt,
        imageTitle,
        imageGenPrompt,
        generatedImage: url,
        generatedImageDescription: description,
        generatedTags: tagGenPrompt,
      });
    } catch (error) {
      return res.status(500).json({ result: null, error: error });
    }
  }
}

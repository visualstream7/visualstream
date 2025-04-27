// @ts-nocheck
import { SupabaseWrapper } from "@/database/supabase";
import { NextApiRequest, NextApiResponse } from "next";
import { parseStringPromise } from "xml2js";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import https from "https";
import FormData from "form-data";

export const config = { maxDuration: 200 };

// make a sleep function
const sleep = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const generateImage = async (prompt) => {
  console.log("Image Generation Prompt from AI: ", prompt);
  const response = await fetch("https://modelslab.com/api/v6/images/text2img", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key: "pJNpP027ksFNqL1IdbkRNouBNJaeI5gMqxVaSfOSv1wWyilSIcpXgBisDFGw",
      model_id: "flux",
      prompt: prompt,
      width: "1024",
      height: "1024",
      samples: "1",
      num_inference_steps: "30",
      safety_checker: "no",
      enhance_prompt: "yes",
      seed: null,
      guidance_scale: 7.5,
      self_attention: "no",
      vae: null,
      webhook: null,
      track_id: null,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  return data?.output?.[0]; // returns the first image URL
};

async function generateImageFromPrompt(openai, prompt) {
  console.log("Image Generation prompt : ", prompt);
  const imageUrl = await generateImage(prompt);
  console.log("imageUrl", imageUrl);

  //
  const response = await fetch(imageUrl);
  const imageArrayBuffer = await response.arrayBuffer();
  const base64ImageData = Buffer.from(imageArrayBuffer).toString("base64");

  const ai = new GoogleGenAI({
    apiKey: "AIzaSyBzWaUpsbCzQdarvv14X7M7tKiXDcyDP_4",
  });

  //
  const result = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64ImageData,
        },
      },
      { text: "Describe this image in 3 lines." },
    ],
  });
  let imageDescription = result.text;
  console.log("imageDescription", imageDescription);

  return {
    url: imageUrl,
    description: imageDescription,
  };
}

async function publishInstagramPost(imageUrl, caption, instagram_access_token) {
  const accessToken = instagram_access_token; // Replace with your actual access token
  // const accessToken =
  //   "EAAUO4ZAMgtkIBOxVvZC7IYxGpqFxIOmtLBaRGcLUZCcgNZCgo5iyD7wUGgZBpyS2bu0Qrw6DtqElR2H4kbO179elKh2mmSfwKiMbXntZALVi5267Y6CjFDgNuaL967aq3IMAdgdQ8hSJkohWS0QghsQh1P0pUsLbNQTlef4ahZAjfYICnXauP7LDZBiZA"; // Replace with your actual access token
  const instagramAccountId = "17841463996337780"; // Replace with your Instagram account ID

  try {
    const uploadResponse = await fetch(
      `https://graph.facebook.com/v22.0/${instagramAccountId}/media`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption,
          access_token: accessToken,
        }),
      },
    );

    console.log("uploadResponse", uploadResponse);

    const uploadData = await uploadResponse.json();
    if (!uploadData.id) throw new Error("Failed to upload media.");

    // Step 2: Publish the uploaded image
    const publishResponse = await fetch(
      `https://graph.facebook.com/v22.0/${instagramAccountId}/media_publish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creation_id: uploadData.id,
          access_token: accessToken,
        }),
      },
    );

    const publishData = await publishResponse.json();
    if (!publishData.id) throw new Error("Failed to publish media.");

    console.log("Post published successfully!", publishData);
    return publishData;
  } catch (error) {
    console.error("Error publishing post:", error);
  }
}

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
  console.log("prompt", prompt);
  console.log("Result : ", completion.choices[0].message.content);
  console.log("-------------------------------------------------------------");
  return completion.choices[0].message.content;
}

function extractLastLinkBeforePubDate(xmlString) {
  // Find the index of the first <pubDate> tag.
  const pubDateIndex = xmlString.indexOf("<pubDate>");

  // Determine the portion of the XML to scan.
  // If a pubDate is found, we consider only text before it;
  // otherwise, we use the entire XML string.
  const searchArea =
    pubDateIndex !== -1 ? xmlString.substring(0, pubDateIndex) : xmlString;

  // Create a regular expression to match <link>...</link> tags.
  const linkRegex = /<link>([\s\S]*?)<\/link>/g;
  let lastLink = null;
  let match;

  // Loop through all matches in the searchArea.
  while ((match = linkRegex.exec(searchArea)) !== null) {
    // Save the link content (trimmed) from each match.
    lastLink = match[1].trim();
  }

  // Return the last link found before the first pubDate.
  return lastLink;
}

const fetchAccessToken = async (supabase) => {
  const { data, error } = await supabase
    // @ts-ignore
    .from("variables")
    .select("*")
    .eq("id", "insta_token")
    .single();

  if (error) {
    return null;
  } else {
    return data.value;
  }
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ result: null, error: "Method Not Allowed" });
  }

  const database = new SupabaseWrapper("SERVER", req, res);
  const client = database.getClient();
  const { categories, error } = await fetchCategories(client);
  const instagram_access_token = await fetchAccessToken(client);

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

  if (categoryToRun.type === "normal") {
    try {
      const feedData = await fetchRSSFeed(categoryToRun.rssFeedUrl);
      let articleLink = extractLastLinkBeforePubDate(feedData) || null;
      const jsonResult = await parseStringPromise(feedData);
      let feedTextContent = JSON.stringify(jsonResult, null, 2);
      feedTextContent = feedTextContent.split("pubDate")[0] || feedTextContent;
      console.log("articleLink", articleLink);

      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      });

      const feedSummaryByChatgpt = await generateAIContent(
        openai,
        `${categoryToRun.summaryPrompt} : "article : ${feedTextContent}"`,
      );
      const captionByChatgpt = await generateAIContent(
        openai,
        `${categoryToRun.captionPrompt} : "{article summary : ${feedSummaryByChatgpt}}"`,
      );
      const imageTitle = await generateAIContent(
        openai,
        `${categoryToRun.imageTitlePrompt} : "article summary: ${feedSummaryByChatgpt}"`,
      );
      const imageGenPrompt = await generateAIContent(
        openai,
        `
          - You must resopnd with only 1 large sentence -> (the image generation prompt).
          - Don't explain anything or use any conversational language. Just respond with the image generation prompt.
          - The prompts theme should be based on the '# article summary'.
          - The prompts detail should be based on the '# prompt details'.

          # article summary : "${feedSummaryByChatgpt}"
          # prompt details : "${categoryToRun.imageGenPrompt}"
          `,
      );

      const { url, description } = await generateImageFromPrompt(
        openai,
        `${imageGenPrompt}`,
      );

      const tagGenPrompt = await generateAIContent(
        openai,
        `${categoryToRun.tagPrompt} : "{image description : ${description}}" and  "{article summary : ${feedSummaryByChatgpt}}"`,
      );

      if (!url) {
        return res
          .status(500)
          .json({ result: null, error: "No image generated" });
      }

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
            article_link: articleLink,
            category: categoryToRun.name,
            ai_tags: tagGenPrompt,
            ai_article_describe: feedSummaryByChatgpt,
          }),
        },
      );

      const addImageData = await addImageResponse.json();

      const id = addImageData?.result?.image_data?.id || null;
      const imageUrl = url;

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
      console.log("processImageData after image upload : ", processImageData);

      await publishInstagramPost(
        processImageData.result.image_data.image_url,
        captionByChatgpt,
        instagram_access_token,
      );
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
        `
        - You must respond with only the year or the letter.
        - Don't explain anything or use any conversational language. Just respond with the year or the letter.

        ${categoryToRun.summaryPrompt}`,
      );
      console.log(
        "-------------------------------------------------------------",
      );
      const captionByChatgpt = await generateAIContent(
        openai,
        `
        - You must resopnd with only the social media catpion.
        - Don't explain anything or use any conversational language. Just respond with the caption.

        ${categoryToRun.captionPrompt} : "{ extracted data : ${feedSummaryByChatgpt}}"`,
      );
      console.log(
        "-------------------------------------------------------------",
      );
      const imageTitle = await generateAIContent(
        openai,
        `
        - You must resopnd with only the image title in 1 line.
        - Don't explain anything or use any conversational language. Just respond with an image title.

        ${categoryToRun.imageTitlePrompt} : "{ extracted data : ${feedSummaryByChatgpt}}"`,
      );
      console.log(
        "-------------------------------------------------------------",
      );
      const imageGenPrompt = await generateAIContent(
        openai,
        `
        - You must resopnd with only 1 large sentence -> (the image generation prompt).
        - Don't explain anything or use any conversational language. Just respond with the image generation prompt.
        - The prompt theme should be based on the '# prompt details'.

        # prompt details : "${categoryToRun.imageGenPrompt}, where Summary is : ${feedSummaryByChatgpt}"`,
      );
      console.log(
        "-------------------------------------------------------------",
      );

      const { url, description } = await generateImageFromPrompt(
        openai,
        `${imageGenPrompt}`,
      );
      console.log(
        "-------------------------------------------------------------",
      );

      const tagGenPrompt = await generateAIContent(
        openai,
        `${categoryToRun.tagPrompt} : "{image description : ${description}}"`,
      );
      console.log(
        "-------------------------------------------------------------",
      );

      if (!url) {
        return res
          .status(500)
          .json({ result: null, error: "No image generated" });
      }

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
            article_link: "n/a",
            category: categoryToRun.name,
            ai_tags: tagGenPrompt,
            ai_article_describe: description || feedSummaryByChatgpt,
          }),
        },
      );

      const addImageData = await addImageResponse.json();
      console.log("addImageData", addImageData);

      const id = addImageData?.result?.image_data?.id || null;
      const imageUrl = url;

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
      console.log("processImageData after image upload : ", processImageData);

      await publishInstagramPost(
        processImageData.result.image_data.image_url,
        captionByChatgpt,
      );

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

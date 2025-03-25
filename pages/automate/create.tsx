// @ts-nocheck

import { useState } from "react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { UploadButton } from "@/utils/uploadthing";

export default function ProcessImage() {
  const [formData, setFormData] = useState({
    caption: "",
    title: "",
    ai_describe: "",
    article_link: "",
    category: "",
    ai_tags: "",
    ai_article_describe: "",
  });
  const [imageUrl, setImageUrl] = useState("");
  const [imageText, setImageText] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState<string[]>([]); // State to hold tags

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!imageUrl) {
      setError("Please upload an image first");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/automate/add-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image_url: imageUrl,
          ai_tags: tags.join(", "),
        }), // Send tags as a comma-separated string
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError("Error processing image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-semibold mb-6">Process Image</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.keys(formData).map((key) => {
          if (key === "ai_tags") {
            return (
              <div key={key}>
                <label
                  htmlFor={key}
                  className="block text-sm font-medium text-gray-700"
                >
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-500 text-white rounded-full flex items-center justify-between space-x-2"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-white text-xs ml-2"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center mt-4">
                  <input
                    type="text"
                    name="tagInput"
                    placeholder="Add a tag"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.target.value.trim()) {
                        handleAddTag(e.target.value.trim());
                        e.target.value = ""; // Clear input after adding tag
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.querySelector(
                        'input[name="tagInput"]',
                      );
                      if (input) {
                        const value = input.value.trim();
                        if (value) {
                          handleAddTag(value);
                          input.value = "";
                        }
                      }
                    }}
                    className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Add Tag
                  </button>
                </div>
              </div>
            );
          }
          return (
            <div key={key}>
              <label
                htmlFor={key}
                className="block text-sm font-medium text-gray-700"
              >
                {key.replace("_", " ").toUpperCase()}
              </label>
              <input
                type="text"
                name={key}
                value={formData[key]}
                onChange={handleChange}
                placeholder={key.replace("_", " ").toUpperCase()}
                className="w-full p-2 border rounded mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          );
        })}

        <UploadButton
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            console.log("Files: ", res);
            let file = res[0];
            let url = file?.url;
            if (!url) return;
            setImageUrl(url);
            setImageText(file.name);
          }}
          onUploadError={(error: Error) => {
            alert(`ERROR! ${error.message}`);
          }}
        />
        <p className="mt-2 text-sm text-gray-500">{imageText}</p>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded mt-4"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {response && (
        <pre className="mt-2 p-2 bg-gray-100 text-sm">
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}

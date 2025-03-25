// @ts-nocheck

import { useState } from "react";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";

uploadButt;
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
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
      const res = await fetch("/api/process-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, image_url: imageUrl }),
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
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-md">
      <h2 className="text-lg font-semibold mb-4">Process Image</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        {Object.keys(formData).map((key) => (
          <input
            key={key}
            type="text"
            name={key}
            value={formData[key]}
            onChange={handleChange}
            placeholder={key.replace("_", " ").toUpperCase()}
            className="w-full p-2 border rounded"
            required
          />
        ))}
        <UploadButton
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            if (res && res.length > 0) {
              setImageUrl(res[0].url);
            }
          }}
          onUploadError={(error) => {
            setError("Upload failed");
          }}
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
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

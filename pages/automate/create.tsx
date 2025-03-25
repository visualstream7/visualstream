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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("details");
  const [showSuccess, setShowSuccess] = useState(false);


  const resetForm = () => {
    setFormData({
      caption: "",
      title: "",
      ai_describe: "",
      article_link: "",
      category: "",
      ai_tags: "",
      ai_article_describe: "",
    });
    setImageUrl("");
    setImageText("");
    setTags([]);
    setActiveTab("details");
  };

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
        }),
      });
      const data = await res.json();
      setResponse(data);
      resetForm();
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000); // Hide after 3 seconds
    } catch (err) {
      setError("Error processing image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-8 px-8 shadow-md">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Manually upload image</h1>
              <p className="text-lg opacity-90 mt-1 font-light">Manually add image to your database</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "details" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                Content Details
              </button>
              <button
                onClick={() => setActiveTab("ai")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "ai" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >Description & Tags
              </button>
              <button
                onClick={() => setActiveTab("media")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "media" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                Media Upload
              </button>
            </nav>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {/* Content Details Section */}
            {activeTab === "details" && (
              <div className="px-8 py-6">
                <h2 className="text-lg font-medium text-gray-900">Content Information</h2>
                <p className="mt-1 text-sm text-gray-500">Provide essential details about your content</p>

                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                      placeholder="Enter a descriptive title"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="caption" className="block text-sm font-medium text-gray-700">
                      Caption
                    </label>
                    <textarea
                      name="caption"
                      id="caption"
                      rows={3}
                      value={formData.caption}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                      placeholder="Add a brief caption for your content"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      id="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                      placeholder="Enter category"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="article_link" className="block text-sm font-medium text-gray-700">
                      Article Link
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                        https://
                      </span>
                      <input
                        type="url"
                        name="article_link"
                        id="article_link"
                        value={formData.article_link}
                        onChange={handleChange}
                        className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                        placeholder="example.com/article"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Processing Section */}
            {activeTab === "ai" && (
              <div className="px-8 py-6 bg-gray-50/50">
                <h2 className="text-lg font-medium text-gray-900">AI Enhancements</h2>
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label htmlFor="ai_describe" className="block text-sm font-medium text-gray-700">
                      Image Description
                    </label>
                    <textarea
                      name="ai_describe"
                      id="ai_describe"
                      rows={2}
                      value={formData.ai_describe}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                      placeholder="Describe what's in your image"
                    />
                   
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="ai_article_describe" className="block text-sm font-medium text-gray-700">
                      Article Summary
                    </label>
                    <textarea
                      name="ai_article_describe"
                      id="ai_article_describe"
                      rows={3}
                      value={formData.ai_article_describe}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                      placeholder="Paste or write a brief summary of the article"
                    />
                   
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                      Content Tags
                    </label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-200 hover:text-indigo-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        name="tagInput"
                        id="tagInput"
                        className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                        placeholder="Add relevant tags"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.target.value.trim()) {
                            e.preventDefault();
                            handleAddTag(e.target.value.trim());
                            e.target.value = "";
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling;
                          if (input.value.trim()) {
                            handleAddTag(input.value.trim());
                            input.value = "";
                          }
                        }}
                        className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 hover:bg-gray-100"
                      >
                        Add
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Press Enter or click Add to include tags</p>
                  </div>
                </div>
              </div>
            )}

            {/* Media Upload Section */}
            {activeTab === "media" && (
              <div className="px-8 py-6">
                <h2 className="text-lg font-medium text-gray-900">Media Upload</h2>
                <p className="mt-1 text-sm text-gray-500">Upload your images</p>

                <div className="mt-6">
                  <div className={`relative rounded-lg border-2 border-dashed ${imageUrl ? 'border-green-300 bg-green-50' : 'border-gray-300'} p-12 text-center hover:border-indigo-400 transition-colors duration-200`}>
                    {uploading ? (
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                        <p className="text-sm text-gray-600">Uploading your media...</p>
                        <p className="text-xs text-gray-500">Please don't close this window</p>
                      </div>
                    ) : imageUrl ? (
                      <div className="flex flex-col items-center">
                        <div className="relative group">
                          <img
                            src={imageUrl}
                            alt="Uploaded preview"
                            className="mx-auto h-40 w-40 object-cover rounded-lg shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImageUrl("");
                              setImageText("");
                            }}
                            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                          >
                            ×
                          </button>
                        </div>
                        <p className="mt-3 text-sm font-medium text-gray-900">{imageText}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setImageUrl("");
                            setImageText("");
                          }}
                          className="mt-2 text-sm text-red-600 hover:text-red-800"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex flex-col items-center text-sm text-gray-600">
                          <label className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                            <UploadButton
                              endpoint="imageUploader"
                              onClientUploadComplete={(res) => {
                                setUploading(false);
                                let file = res[0];
                                let url = file?.url;
                                if (!url) return;
                                setImageUrl(url);
                                setImageText(file.name);
                              }}
                              onUploadError={(error: Error) => {
                                setUploading(false);
                                alert(`ERROR! ${error.message}`);
                              }}
                              onUploadBegin={() => {
                                setUploading(true);
                              }}
                              appearance={{
                                button: {
                                  background: "transparent",
                                  color: "rgb(79, 70, 229)",
                                  padding: "0",
                                  fontWeight: "500",
                                  ":hover": {
                                    color: "rgb(67, 56, 202)",
                                  },
                                },
                              }}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}



            {/* Form Actions */}
            <div className="px-8 py-6 bg-gray-50 flex justify-between items-center">
              <div>
                {activeTab !== "details" && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === "ai" ? "details" : "ai")}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back
                  </button>
                )}
              </div>
              <div className="flex space-x-3">
                {activeTab !== "media" ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === "details" ? "ai" : "media")}
                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Continue
                    <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || uploading}
                    className={`inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${loading || uploading
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                  >
                    {loading ? (
                      <>
                        <svg className="-ml-1 mr-2 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "Submit Content"
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>

          {showSuccess && (
            <div className="px-8 pb-6">
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Success!</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Your content has been successfully submitted.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
}
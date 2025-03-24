// @ts-nocheck
import { SupabaseWrapper } from "@/database/supabase";
import { CircleDashed } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BiCheck, BiX } from "react-icons/bi";
import {
  FiClock,
  FiPause,
  FiPlay,
  FiTag,
  FiLink,
  FiEdit2,
  FiHash,
  FiAlertCircle,
  FiGrid,
} from "react-icons/fi";

const database = new SupabaseWrapper("CLIENT");
const client = database.getClient();

const scheduleOptions = [
  { label: "Every 15 minutes", value: 900 },
  { label: "Every 30 minutes", value: 1800 },
  { label: "Every hour", value: 3600 },
  { label: "Every 2 hours", value: 7200 },
  { label: "Every 4 hours", value: 14400 },
  { label: "Every 8 hours", value: 28800 },
];

export default function Category() {
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState(null);
  const [editedCategory, setEditedCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const taskListener = client
      .channel("public:categories")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "categories" },
        (payload) => {
          console.log("Change received!", payload);
          setIsRunning(payload.new.isRunning || false);
        },
      )
      .subscribe();

    // add return right here!
    return () => taskListener.unsubscribe();
  }, []);

  useEffect(() => {
    let categoryId = params?.category || null;
    if (!categoryId) return;

    async function fetchCategory() {
      let { result, error } = await database.getCategoryById(categoryId);
      if (error || !result) return;
      setCategory(result);
      setEditedCategory(result);
      setIsRunning(result.isRunning);
    }

    fetchCategory();
  }, [params]);

  useEffect(() => {
    if (category && editedCategory) {
      setHasChanges(
        JSON.stringify(category) !== JSON.stringify(editedCategory),
      );
    }
  }, [category, editedCategory]);

  const handleChange = (e) => {
    if (!editedCategory) return;
    setEditedCategory({ ...editedCategory, [e.target.name]: e.target.value });
  };

  const handleScheduleChange = (e) => {
    if (!editedCategory) return;
    setEditedCategory({ ...editedCategory, schedule: Number(e.target.value) });
  };

  const togglePaused = () => {
    if (!editedCategory) return;
    setEditedCategory({ ...editedCategory, paused: !editedCategory.paused });
  };

  const updateCategory = async () => {
    if (!editedCategory || !category || !hasChanges) return;
    setIsSaving(true);
    try {
      await database.updateCategory(category.id, editedCategory);
      setCategory(editedCategory);
    } catch (error) {
      console.error("Failed to update category:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = () => {
    if (!category) return;
    setEditedCategory({ ...category });
  };

  if (!category || !editedCategory)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded-full w-32"></div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content - Full Screen */}
      <div className="w-full h-full">
        {/* Header with Dashboard Button */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-6 sm:px-8 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Edit Automation
              </h1>
              <p className="text-indigo-100 mt-1">{category.name}</p>
            </div>
            <div className="flex items-center gap-4 flex-col-reverse md:flex-row">
              <div
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-sm ${isRunning ? "bg-amber-100 text-amber-800" : "hidden"}`}
              >
                {isRunning && (
                  <>
                    <CircleDashed className="mr-2 animate-spin" />
                    Running ...
                  </>
                )}
              </div>

              <div
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-sm ${editedCategory.paused ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}
              >
                {editedCategory.paused ? (
                  <>
                    <FiPause className="mr-2" />
                    Paused
                  </>
                ) : (
                  <>
                    <FiPlay className="mr-2" />
                    Active
                  </>
                )}
              </div>
              <button
                onClick={() => router.push("/automate")}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all"
              >
                <FiGrid className="text-white" />
                <span className="text-white text-sm font-medium">
                  Dashboard
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Content - Full Width */}
        <div className="w-full px-6 py-8 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center text-sm font-medium text-gray-700 mb-4">
                  <FiTag className="mr-3 text-indigo-500 text-lg" />
                  <h2 className="text-lg font-semibold">Category Details</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Name
                      <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editedCategory.name || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Enter category name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      RSS Feed URL
                      <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        name="rssFeedUrl"
                        value={editedCategory.rssFeedUrl || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all pl-10"
                        placeholder="https://example.com/feed.xml"
                      />
                      <FiLink className="absolute left-3 top-3.5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center text-sm font-medium text-gray-700 mb-4">
                  <FiClock className="mr-3 text-indigo-500 text-lg" />
                  <h2 className="text-lg font-semibold">Schedule Settings</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Update Frequency
                    </label>
                    <div className="relative">
                      <select
                        value={editedCategory.schedule || ""}
                        onChange={handleScheduleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none"
                      >
                        {scheduleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Automation Status
                      </label>
                      <p className="text-sm text-gray-600">
                        {editedCategory.paused
                          ? "Automation is currently paused"
                          : "Automation is running normally"}
                      </p>
                    </div>
                    <button
                      onClick={togglePaused}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${editedCategory.paused ? "bg-gray-300" : "bg-indigo-600"}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${editedCategory.paused ? "translate-x-1" : "translate-x-6"}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center text-sm font-medium text-gray-700 mb-4">
                  <FiEdit2 className="mr-3 text-indigo-500 text-lg" />
                  <h2 className="text-lg font-semibold">Content Prompts</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Summary Prompt
                    </label>
                    <textarea
                      name="summaryPrompt"
                      value={editedCategory.summaryPrompt || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all min-h-[120px]"
                      placeholder="Enter prompt for generating summaries..."
                    />
                    <p className="mt-1 text-xs text-gray-500 flex items-center">
                      <FiAlertCircle className="mr-1" />
                      Leave empty to use default prompt
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Social Caption Prompt
                      <span className="text-gray-400 ml-1.5 text-xs">
                        (Optional)
                      </span>
                    </label>
                    <textarea
                      name="captionPrompt"
                      value={editedCategory.captionPrompt || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all min-h-[120px]"
                      placeholder="Enter prompt for generating social captions..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center text-sm font-medium text-gray-700 mb-4">
                  <FiHash className="mr-3 text-indigo-500 text-lg" />
                  <h2 className="text-lg font-semibold">Media & Metadata</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Image Title Prompt
                    </label>
                    <textarea
                      name="imageTitlePrompt"
                      value={editedCategory.imageTitlePrompt || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all min-h-[100px]"
                      placeholder="Enter prompt for generating image titles..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Image Generation Prompt
                    </label>
                    <textarea
                      name="imageGenPrompt"
                      value={editedCategory.imageGenPrompt || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all min-h-[100px]"
                      placeholder="Enter prompt for generating images..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tagging Prompt
                    </label>
                    <textarea
                      name="tagPrompt"
                      value={editedCategory.tagPrompt || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all min-h-[100px]"
                      placeholder="Enter prompt for generating tags..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3 max-w-7xl mx-auto">
            {hasChanges && (
              <div className="mr-auto flex items-center text-sm text-gray-500">
                <FiAlertCircle className="mr-2 text-amber-500" />
                You have unsaved changes
              </div>
            )}
            <button
              onClick={discardChanges}
              disabled={!hasChanges}
              className={`flex items-center px-5 py-3 text-sm font-medium rounded-lg transition-all ${hasChanges ? "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50" : "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"}`}
            >
              <BiX className="mr-2 text-lg" />
              Discard Changes
            </button>
            <button
              onClick={updateCategory}
              disabled={!hasChanges || isSaving}
              className={`flex items-center px-5 py-3 text-sm font-medium text-white rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${hasChanges ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700" : "bg-gradient-to-r from-indigo-400 to-blue-400 cursor-not-allowed"}`}
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <BiCheck className="mr-2 text-lg" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

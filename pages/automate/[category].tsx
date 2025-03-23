// @ts-nocheck
import { SupabaseWrapper } from "@/database/supabase";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BiLeftArrow } from "react-icons/bi";

const database = new SupabaseWrapper("CLIENT");

const scheduleOptions = [
  { label: "Every 15 min", value: 900 },
  { label: "Every 30 min", value: 1800 },
  { label: "Every 1 hour", value: 3600 },
  { label: "Every 2 hours", value: 7200 },
  { label: "Every 4 hours", value: 14400 },
  { label: "Every 8 hours", value: 28800 },
];

export default function Category() {
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState(null);
  const [editedCategory, setEditedCategory] = useState(null);

  useEffect(() => {
    console.log(params);
    let categoryId = params?.category || null;
    if (!categoryId) return;

    async function fetchCategory() {
      let { result, error } = await database.getCategoryById(categoryId);
      if (error || !result) return;
      setCategory(result);
      setEditedCategory(result);
    }

    fetchCategory();
  }, [params]);

  const handleChange = (e) => {
    setEditedCategory({ ...editedCategory, [e.target.name]: e.target.value });
  };

  const handleScheduleChange = (e) => {
    setEditedCategory({ ...editedCategory, schedule: Number(e.target.value) });
  };

  const togglePaused = () => {
    setEditedCategory({ ...editedCategory, paused: !editedCategory.paused });
  };

  const updateCategory = async () => {
    if (!editedCategory || !category) return;
    await database.updateCategory(category.id, editedCategory);
    setCategory(editedCategory);
  };

  const discardChanges = () => {
    setEditedCategory(category);
  };

  if (!category) return <div>Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md">
      <BiLeftArrow
        onClick={() => router.push("/automate")}
        className="text-2xl mb-4 cursor-pointer"
      />
      <h2 className="text-xl font-semibold mb-4">Edit Category</h2>
      <label className="block mb-2">Name</label>
      <textarea
        type="text"
        name="name"
        value={editedCategory.name}
        onChange={handleChange}
        className="w-full border p-2 rounded-md mb-4"
      />
      <label className="block mb-2">RSS Feed URL</label>
      <textarea
        type="text"
        name="rssFeedUrl"
        value={editedCategory.rssFeedUrl}
        onChange={handleChange}
        className="w-full border p-2 rounded-md mb-4"
      />
      <label className="block mb-2">Article Summary Prompt</label>
      <textarea
        type="text"
        name="summaryPrompt"
        value={editedCategory.summaryPrompt}
        onChange={handleChange}
        className="w-full border p-2 rounded-md mb-4"
      />
      <label className="block mb-2">Social Media Caption Prompt</label>
      <textarea
        type="text"
        name="captionPrompt"
        value={editedCategory.captionPrompt}
        onChange={handleChange}
        className="w-full border p-2 rounded-md mb-4"
      />
      <label className="block mb-2">Image Title Prompt</label>
      <textarea
        type="text"
        name="imageTitlePrompt"
        value={editedCategory.imageTitlePrompt}
        onChange={handleChange}
        className="w-full border p-2 rounded-md mb-4"
      />
      <label className="block mb-2">Image Generation Prompt</label>
      <textarea
        type="text"
        name="imageGenPrompt"
        value={editedCategory.imageGenPrompt}
        onChange={handleChange}
        className="w-full border p-2 rounded-md mb-4"
      />

      <label className="block mb-2">Tag Prompt</label>
      <textarea
        type="text"
        name="tagPrompt"
        value={editedCategory.tagPrompt}
        onChange={handleChange}
        className="w-full border p-2 rounded-md mb-4"
      />

      <label className="block mb-2">Schedule</label>
      <select
        value={editedCategory.schedule}
        onChange={handleScheduleChange}
        className="w-full border p-2 rounded-md mb-4"
      >
        {scheduleOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="flex items-center mb-4">
        <label className="mr-2">Paused:</label>
        <button
          onClick={togglePaused}
          className={`px-4 py-2 rounded-md text-white ${editedCategory.paused ? "bg-red-500" : "bg-green-500"}`}
        >
          {editedCategory.paused ? "Paused" : "Active"}
        </button>
      </div>
      <div className="flex gap-4">
        <button
          onClick={updateCategory}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Update Category
        </button>
        <button
          onClick={discardChanges}
          className="bg-gray-400 text-white px-4 py-2 rounded-md"
        >
          Discard Changes
        </button>
      </div>
    </div>
  );
}

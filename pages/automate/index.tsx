import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SupabaseWrapper } from "@/database/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

const dummyCategories = [
  { id: 1, name: "Tech News", schedule: 1800, paused: false },
  { id: 2, name: "AI Updates", schedule: 3600, paused: true },
  { id: 3, name: "Sports Highlights", schedule: 900, paused: false },
];

const database = new SupabaseWrapper("CLIENT");

export default function CategoriesDashboard() {
  const [categories, setCategories] = useState<any[]>([]);
  const [view, setView] = useState("list");
  const router = useRouter();
  const [category, setCategory] = useState({
    name: "",
    rssFeedUrl: "",
    summaryPrompt: "",
    captionPrompt: "",
    imageTitlePrompt: "",
    imageGenPrompt: "",
    tagPrompt: "",
    schedule: 1800,
    paused: false,
  });

  const scheduleOptions = [
    { label: "Every 15 min", value: 900 },
    { label: "Every 30 min", value: 1800 },
    { label: "Every 1 hour", value: 3600 },
    { label: "Every 2 hours", value: 7200 },
    { label: "Every 4 hours", value: 14400 },
    { label: "Every 8 hours", value: 28800 },
  ];

  useEffect(() => {
    async function fetchCategories() {
      const { result, error } = await database.getCategories();
      if (!error && result) {
        setCategories(
          result.map((cat: any) => ({
            ...cat,
            schedule: parseInt(cat.schedule),
          })),
        );
      }
    }
    fetchCategories();
  }, []);

  // realtime updates to categories

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setCategory((prev) => ({
      ...prev,
      [name]: name === "schedule" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log(category);
    const { result, error } = await database.addCategory(category);

    const { result: categories, error: categoriesError } =
      await database.getCategories();

    if (!error && result) {
      setCategories(
        categories.map((cat: any) => ({
          ...cat,
          schedule: scheduleOptions.find(
            (opt) => opt.value === parseInt(cat.schedule),
          )?.label,
        })),
      );
    }

    setView("list");
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {view === "list" ? (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <button
            onClick={() => setView("create")}
            className="bg-blue-600 text-white p-2 rounded mb-4 hover:bg-blue-700"
          >
            Create Category
          </button>
          <div className="space-y-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex justify-between items-center p-4 border rounded-lg shadow-sm"
                onClick={() => router.push(`/automate/${cat.id}`)}
              >
                <div>
                  <h3 className="text-lg font-medium">{cat.name}</h3>
                  <p className="text-sm text-gray-500">
                    {
                      scheduleOptions.find((opt) => opt.value === cat.schedule)
                        ?.label
                    }
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded text-white ${cat.paused ? "bg-red-500" : "bg-green-500"}`}
                >
                  {cat.paused ? "Paused" : "Active"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Create Category</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Category Name</label>
              <input
                className="w-full p-2 border rounded"
                name="name"
                value={category.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">RSS Feed URL</label>
              <input
                className="w-full p-2 border rounded"
                name="rssFeedUrl"
                value={category.rssFeedUrl}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Summary Prompt
              </label>
              <textarea
                className="w-full p-2 border rounded"
                name="summaryPrompt"
                value={category.summaryPrompt}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Caption Prompt
              </label>
              <textarea
                className="w-full p-2 border rounded"
                name="captionPrompt"
                value={category.captionPrompt}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Image Title Prompt
              </label>
              <textarea
                className="w-full p-2 border rounded"
                name="imageTitlePrompt"
                value={category.imageTitlePrompt}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Image Generation Prompt
              </label>
              <textarea
                className="w-full p-2 border rounded"
                name="imageGenPrompt"
                value={category.imageGenPrompt}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Tag Prompt</label>
              <textarea
                className="w-full p-2 border rounded"
                name="tagPrompt"
                value={category.tagPrompt}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Schedule</label>
              <select
                className="w-full p-2 border rounded"
                name="schedule"
                value={category.schedule}
                onChange={handleChange}
                required
              >
                {scheduleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Paused</label>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={category.paused}
                onChange={(e) =>
                  setCategory((prev) => ({ ...prev, paused: e.target.checked }))
                }
              />
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setView("list")}
                className="bg-gray-600 text-white p-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

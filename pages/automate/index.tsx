import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SupabaseWrapper } from "@/database/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { list_of_admin_emails } from "@/data/admins";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { FullPageSpinner } from "@/components/spinners/fullPageSpiner";

const database = new SupabaseWrapper("CLIENT");

export default function CategoriesDashboard() {
  const [categories, setCategories] = useState<any[]>([]);
  const [view, setView] = useState("list");
  const router = useRouter();
  const [deleteCategory, setDeleteCategory] = useState(null);
  const [type, setType] = useState<"normal" | "special">("normal");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

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

  interface Category {
    id: string;
    name: string;
    displayName?: string;
    rssFeedUrl?: string;
    summaryPrompt?: string;
    captionPrompt?: string;
    imageTitlePrompt?: string;
    imageGenPrompt?: string;
    tagPrompt?: string;
    schedule?: number;
    last_ran_at?: string;
    paused?: boolean;
    priority?: number;
  }

  const handleEditDisplayName = (category: Category) => {
    setEditingId(category.id);
    setEditValue(category.displayName || category.name);
  };

  const handleSaveDisplayName = async (categoryId: string) => {
    try {
      const updatedCategories = categories.map((cat) =>
        cat.id === categoryId ? { ...cat, displayName: editValue } : cat,
      );
      setCategories(updatedCategories);
      setEditingId(null);

      // Update in database - pass just the string value
      await database.updateCategoryDisplayName(
        Number(categoryId),
        editValue, // Just pass the string value directly
      );
    } catch (error) {
      console.error("Failed to update display name:", error);
      // Optional: Revert UI if update fails
      setEditingId(categoryId);
    }
  };

  function getFields(type: "normal" | "special") {
    if (type === "normal")
      return [
        {
          name: "name",
          label: "Category Name",
          placeholder: "e.g. Technology News",
          icon: "tag",
        },
        {
          name: "rssFeedUrl",
          label: "RSS Feed URL",
          placeholder: "https://example.com/feed.xml",
          icon: "link",
        },
      ];
    return [
      {
        name: "name",
        label: "Category Name",
        placeholder: "e.g. Technology News",
        icon: "tag",
      },
    ];
  }

  const scheduleOptions = [
    { label: "Every 15 min", value: 900 },
    { label: "Every 30 min", value: 1800 },
    { label: "Every 1 hour", value: 3600 },
    { label: "Every 2 hours", value: 7200 },
    { label: "Every 4 hours", value: 14400 },
    { label: "Every 8 hours", value: 28800 },
  ];

  async function fetchCategories() {
    const { result, error } = await database.getCategories();
    if (!error && result) {
      setCategories(
        result
          .map((cat: any) => ({
            ...cat,
            schedule: parseInt(cat.schedule),
          }))
          //@ts-ignore
          .sort((a, b) => a.priority - b.priority), // Sort by priority
      );
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update priorities based on new order
    const updatedCategories = items.map((cat, index) => ({
      ...cat,
      priority: index,
    }));

    setCategories(updatedCategories);

    // Update priorities in database
    try {
      await database.updateCategoryPriorities(updatedCategories);
    } catch (error) {
      console.error("Error updating priorities:", error);
      // Revert if error
      fetchCategories();
    }
  };

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
    const { result, error } = await database.addCategory({
      ...category,
      displayName: category.name,
      type: type,
    });

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

  const { user, isLoaded } = useUser();
  const [deletingId, setDeletingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleDeleteCategory = async (categoryId: any) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    setDeleteCategory(categoryId);
    try {
      const { error } = await database.deleteCategory(categoryId);
      if (error) throw error;

      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    } finally {
      setDeleteCategory(null);
    }
  };

  useEffect(() => {
    const checkAdmin = () => {
      const userEmail = user?.emailAddresses[0].emailAddress;
      setIsAdmin(
        userEmail && list_of_admin_emails.includes(userEmail) ? true : false,
      );
    };
    checkAdmin();
  }, [user]);

  if (!isLoaded) return <FullPageSpinner />;
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300 max-w-sm w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Admin Access Required
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Please sign in with an authorized admin account to access the admin
            panel.
          </p>
          <SignInButton mode="modal">
            <button className="flex bg-[#25384c] p-3 px-4 text-white font-bold rounded-md w-full items-center justify-center hover:bg-[#2f4961] transition">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  if (user && !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300 max-w-sm w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            You do not have permission to access this page with your current
            account.
          </p>
          <SignOutButton>
            <button className="flex bg-[#25384c] p-3 px-4 text-white font-bold rounded-md w-full items-center justify-center hover:bg-[#2f4961] transition">
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {view === "list" ? (
        <div className="bg-white overflow-hidden">
          {/* Header with create button */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Content Categories
                </h2>
                <p className="text-indigo-100 mt-1">
                  Manage your automated content pipelines
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setView("create")}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-5 py-2.5 rounded-lg text-white transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="font-medium">Create Category</span>
                </button>
                {user && (
                  <SignOutButton>
                    <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-5 py-2.5 rounded-lg text-white transition-all">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H3"
                        />
                      </svg>
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </SignOutButton>
                )}
              </div>
            </div>
          </div>

          {/* Category list */}
          <div className="p-6 space-y-4">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="categories">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="p-6 space-y-4"
                  >
                    {categories.map((cat, index) => (
                      <Draggable
                        key={cat.id}
                        draggableId={cat.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex justify-between items-center p-5 mx-auto w-full max-w-[80vw] border border-indigo-300 rounded-xl hover:shadow-md transition-all cursor-pointer ${
                              snapshot.isDragging
                                ? "bg-indigo-50 shadow-lg border-indigo-200"
                                : "bg-white"
                            }`}
                            onClick={(e) => {
                              if (
                                !editingId &&
                                !(e.target as HTMLElement).closest(
                                  ".edit-button",
                                )
                              ) {
                                router.push(`/automate/${cat.id}`);
                              }
                            }}
                          >
                            {/* Left side - Drag handle and main content */}
                            <div className="flex items-center space-x-4 w-full">
                              {/* Drag handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="p-2.5 bg-indigo-50 rounded-lg cursor-move hover:bg-indigo-100 transition-colors"
                              >
                                <svg
                                  className="h-5 w-5 text-indigo-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 8h16M4 16h16"
                                  />
                                </svg>
                              </div>

                              {/* Content area */}
                              <div className="flex-grow min-w-0">
                                {editingId === cat.id ? (
                                  <div className="flex items-center space-x-4 w-full">
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) =>
                                        setEditValue(e.target.value)
                                      }
                                      className="flex-grow border border-gray-300 rounded-lg px-4 py-2.5 text-base font-medium focus:ring-.5 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                      autoFocus
                                      onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        handleSaveDisplayName(cat.id)
                                      }
                                    />
                                    <div className="flex space-x-3">
                                      <button
                                        onClick={() => setEditingId(null)}
                                        className="edit-button px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleSaveDisplayName(cat.id)
                                        }
                                        className="edit-button px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col space-y-1.5">
                                    <div className="flex items-center">
                                      <h3 className="text-lg font-semibold text-gray-800 truncate">
                                        {cat.displayName || cat.name}
                                      </h3>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditDisplayName(cat);
                                        }}
                                        className="edit-button ml-3 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        title="Edit display name"
                                      >
                                        <svg
                                          className="h-4 w-4"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                          />
                                        </svg>
                                      </button>
                                    </div>

                                    <div className="flex items-center space-x-5 text-sm text-gray-600">
                                      <span className="flex items-center space-x-1.5">
                                        <svg
                                          className="h-4 w-4 text-gray-400 flex-shrink-0"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                          />
                                        </svg>
                                        <span className="whitespace-nowrap">
                                          {
                                            scheduleOptions.find(
                                              (opt) =>
                                                opt.value === cat.schedule,
                                            )?.label
                                          }
                                        </span>
                                      </span>
                                      <span className="flex items-center space-x-1.5">
                                        <svg
                                          className="h-4 w-4 text-gray-400 flex-shrink-0"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                          />
                                        </svg>
                                        <span className="whitespace-nowrap">
                                          Updated:{" "}
                                          {new Date(
                                            cat.last_ran_at,
                                          ).toLocaleDateString()}
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right side - Status and actions */}
                            <div className="flex items-center space-x-4 ml-4">
                              {editingId !== cat.id && (
                                <>
                                  <span
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                      cat.paused
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-emerald-100 text-emerald-800"
                                    }`}
                                  >
                                    {cat.paused ? "Paused" : "Active"}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCategory(cat.id);
                                    }}
                                    className="edit-button p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete category"
                                  >
                                    <svg
                                      className="h-5 w-5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                  <svg
                                    className="h-5 w-5 text-gray-300"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      ) : (
        <div className="max-w-full mx-auto bg-white overflow-hidden transition-all duration-300">
          {/* Header with improved gradient */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-6 px-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Create New Category
                </h2>
                <p className="text-sm opacity-90 mt-1 font-light">
                  Configure your automated content pipeline
                </p>
              </div>
            </div>
          </div>

          <form className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-lg font-medium text-gray-700">
                  Category Type:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setType(type === "normal" ? "special" : "normal")
                  }
                  className="relative inline-flex items-center h-9 rounded-full border border-gray-300 bg-gray-100 p-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 overflow-hidden"
                >
                  <div
                    className={`absolute h-8 rounded-full transition-all duration-200 ease-in-out ${
                      type === "normal"
                        ? "left-0.5 w-[50%] bg-gradient-to-r from-indigo-500 to-blue-600"
                        : "left-[50%] w-[50%] bg-gradient-to-r from-indigo-500 to-blue-600"
                    }`}
                  ></div>

                  <div className="relative z-10 flex w-full">
                    <span
                      className={`flex-1 px-4 py-1 text-sm font-medium rounded-full text-center transition-colors duration-200 ${
                        type === "normal" ? "text-white" : "text-gray-600"
                      }`}
                    >
                      Normal
                    </span>
                    <span
                      className={`flex-1 px-4 py-1 text-sm font-medium rounded-full text-center transition-colors duration-200 ${
                        type === "special" ? "text-white" : "text-gray-600"
                      }`}
                    >
                      Special
                    </span>
                  </div>
                </button>
              </div>
              {getFields(type).map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className=" text-sm font-medium text-gray-700 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          field.icon === "tag"
                            ? "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            : "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        }
                      />
                    </svg>
                    {field.label}
                  </label>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm placeholder-gray-400"
                    name={field.name}
                    //@ts-ignore
                    value={category[field.name]}
                    onChange={handleChange}
                    required
                    placeholder={field.placeholder}
                  />
                </div>
              ))}

              <div className="space-y-1">
                <label className=" text-sm font-medium text-gray-700 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Schedule
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
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

              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <input
                  type="checkbox"
                  id="pauseCategory"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={category.paused}
                  onChange={(e) =>
                    setCategory((prev) => ({
                      ...prev,
                      paused: e.target.checked,
                    }))
                  }
                />
                <label
                  htmlFor="pauseCategory"
                  className="text-sm font-medium text-gray-700"
                >
                  Pause this category
                </label>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {[
                {
                  name: "summaryPrompt",
                  label: "Summary Prompt",
                  placeholder:
                    "Write a concise summary highlighting key points...",
                  icon: "annotation",
                },
                {
                  name: "captionPrompt",
                  label: "Caption Prompt",
                  placeholder: "Create an engaging social media caption...",
                  icon: "chat-alt",
                },
                {
                  name: "imageTitlePrompt",
                  label: "Image Title Prompt",
                  placeholder: "Suggest a title for generated images...",
                  icon: "photograph",
                },
                {
                  name: "imageGenPrompt",
                  label: "Image Generation Prompt",
                  placeholder: "Describe the style and content for images...",
                  icon: "color-swatch",
                },
                {
                  name: "tagPrompt",
                  label: "Tag Prompt",
                  placeholder: "Suggest relevant tags separated by commas...",
                  icon: "hashtag",
                },
              ].map((field) => (
                <div key={field.name} className="space-y-1">
                  <label className=" text-sm font-medium text-gray-700 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          field.icon === "annotation"
                            ? "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                            : field.icon === "chat-alt"
                              ? "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                              : field.icon === "photograph"
                                ? "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                : field.icon === "color-swatch"
                                  ? "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                                  : "M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                        }
                      />
                    </svg>
                    {field.label}
                  </label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm placeholder-gray-400 min-h-[80px]"
                    name={field.name}
                    //@ts-ignore
                    value={category[field.name]}
                    onChange={handleChange}
                    required
                    placeholder={field.placeholder}
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </form>

          {/* Action Buttons with better styling */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end space-x-3 rounded-b-2xl">
            <button
              type="button"
              onClick={() => setView("list")}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gray-500 border border-gray-300 rounded-xl hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all duration-200 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Save Category
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

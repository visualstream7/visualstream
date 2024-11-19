import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/database/types";
import { TaskType } from "@/pages/api/add-image";

async function addTasks(tasks: TaskType[], supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("TasksQueue")
    .insert([...tasks])
    .select("*");

  if (error) {
    throw new Error(`Failed to insert user data: ${error.message}`);
  }

  return data ? data[0] : null;
}

export { addTasks };

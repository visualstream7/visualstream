import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/database/types";
import { Printful } from "@/libs/printful-client/printful-sdk";

export type TaskType = {
  image_id: number;
  product_id: number;
  variant_ids: number[];
};

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

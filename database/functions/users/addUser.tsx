import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/database/types";

async function addUser(
  id: string,
  email: string,
  supabase: SupabaseClient<Database>, 
) { 
  const { data, error } = await supabase
    .from("Users")
    .insert([
      {
        id: id,
        email: email,
      },
    ])
    .select("*");

  if (error) {
    throw new Error(`Failed to insert user data: ${error.message}`);
  }

  return data ? data[0] : null;

  
}

export { addUser };

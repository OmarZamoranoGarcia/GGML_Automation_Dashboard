import { getSupabaseAdminClient } from "@/lib/supabase";

const supabase = getSupabaseAdminClient();

export async function findByEmail(email) {

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

    if (error) {
        return null;
    }

    return data;
}
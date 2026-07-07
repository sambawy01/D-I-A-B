import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** The current authenticated user, or null. */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** The current user, or redirect to /login. Use in protected Server Components/actions. */
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

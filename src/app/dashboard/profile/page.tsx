import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileContent from "@/components/dashboard/ProfileContent";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-white">
      <ProfileContent user={user} />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";

export default async function LoginPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex justify-center flex-col items-center gap-8 max-w-6xl w-[95%] mx-auto">
      <LoginForm />

      {/* Footer Text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-gray-700 underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-gray-700 underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

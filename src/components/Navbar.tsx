"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  // Extract user data from different OAuth providers
  const getUserDisplayData = (user: User | null) => {
    if (!user) return null;

    const metadata = user.user_metadata || {};
    const appMetadata = user.app_metadata || {};

    // For GitHub OAuth
    if (appMetadata.provider === "github") {
      return {
        name:
          metadata.full_name ||
          metadata.name ||
          metadata.user_name ||
          user.email?.split("@")[0] ||
          "GitHub User",
        avatar: metadata.avatar_url,
        email: user.email,
        provider: "GitHub",
      };
    }

    // For Google OAuth
    if (appMetadata.provider === "google") {
      return {
        name:
          metadata.full_name ||
          metadata.name ||
          user.email?.split("@")[0] ||
          "Google User",
        avatar: metadata.avatar_url || metadata.picture,
        email: user.email,
        provider: "Google",
      };
    }

    // Fallback for other providers or direct email signup
    return {
      name:
        metadata.full_name ||
        metadata.name ||
        user.email?.split("@")[0] ||
        "User",
      avatar: metadata.avatar_url || metadata.picture,
      email: user.email,
      provider: "Email",
    };
  };

  const userDisplayData = getUserDisplayData(user);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Error signing out");
      } else {
        toast.success("Signed out successfully");
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast.error("Unexpected error occurred");
    }
  };
  return (
    <nav className="flex justify-between flex-wrap items-center gap-8 max-w-6xl w-[90%] mx-auto py-10 text-sm font-inter max-sm:flex-col max-sm:text-center max-sm:items-center max-sm:justify-center">
      <div className="max-w-[90px]">
        <Link href="/">
          <Image
            src="/text-logo.svg"
            alt="Ikiform"
            width={100}
            height={100}
            className="pointer-events-none"
          />
        </Link>
      </div>

      <div className="flex items-center gap-4 flex-wrap justify-center">
        <div className="max-md:hidden">
          <p className="text-gray-500 font-medium">
            Star us on{" "}
            <a
              href="https://github.com/preetsuthar17/Ikiform"
              className="underline text-black"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>{" "}
            and follow us on{" "}
            <a
              href="https://x.com/preetsuthar17"
              className="underline text-black"
              target="_blank"
              rel="noopener noreferrer"
            >
              X (Twitter)
            </a>
          </p>
        </div>{" "}
        {/* Authentication Section */}
        {!loading && (
          <div className="flex items-center gap-2">
            {user && userDisplayData ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={userDisplayData.avatar}
                        alt={userDisplayData.name}
                      />
                      <AvatarFallback>
                        {userDisplayData.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm">
                        {userDisplayData.name}
                      </p>
                      <p className="w-[200px] truncate text-xs text-muted-foreground">
                        {userDisplayData.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/login">Start for free</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

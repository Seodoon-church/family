"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function AuthLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isSetupPage = pathname === "/setup" || pathname === "/setup/";

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }

    // If user is logged in but has no familyId, redirect to setup
    // (except if already on the setup page)
    if (!loading && user && userProfile && !userProfile.familyId && !isSetupPage) {
      router.push("/setup");
    }
  }, [loading, user, userProfile, router, isSetupPage]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="불러오는 중..." />
      </div>
    );
  }

  // Setup page: show without sidebar/header (clean layout)
  if (isSetupPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent-blue/5">
        <div className="px-4 py-6">
          {children}
        </div>
      </div>
    );
  }

  // If no familyId yet, show loading (will redirect to setup)
  if (!userProfile?.familyId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-auto pb-20 md:pb-6 px-4 py-6 md:px-6">
          {children}
        </main>

        <MobileNav />
      </div>
    </div>
  );
}

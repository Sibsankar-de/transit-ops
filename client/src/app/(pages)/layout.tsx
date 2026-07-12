"use client";

import { Suspense, useState } from "react";
import { SideNav } from "@/components/ui/SideNavBar";
import { TopBar } from "@/components/ui/TopBar";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Container */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out md:flex ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Suspense fallback={<div className="w-[var(--sidebar-width)] bg-card border-r border-border h-full" />}>
            <SideNav onMobileClose={() => setSidebarOpen(false)} />
          </Suspense>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar onMenuToggle={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 text-foreground">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

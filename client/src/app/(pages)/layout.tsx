import { Suspense } from "react";
import { SideNav } from "@/components/ui/SideNavBar";
import { TopBar } from "@/components/ui/TopBar";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        <Suspense fallback={<div className="w-[var(--sidebar-width)] bg-card border-r border-border h-full" />}>
          <SideNav />
        </Suspense>
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6 text-foreground">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

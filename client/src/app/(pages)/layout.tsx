import { Suspense } from "react";
import { SideNav } from "@/components/ui/SideNavBar";
import { TopBar } from "@/components/ui/TopBar";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}


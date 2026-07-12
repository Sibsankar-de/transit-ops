import { SideNav } from "@/components/ui/SideNavBar";
import { TopBar } from "@/components/ui/TopBar";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SideNav />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 text-foreground">
          {children}
        </main>
      </div>
    </div>
  );
}

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function Shell({
  visibleSlugs,
  userName,
  children,
}: {
  visibleSlugs: string[];
  userName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar visibleSlugs={visibleSlugs} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar userName={userName} visibleSlugs={visibleSlugs} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

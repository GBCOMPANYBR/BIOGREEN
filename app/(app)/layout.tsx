import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/permissions";
import { getVisibleSlugs } from "@/lib/nav-visibility";
import { Shell } from "@/components/layout/shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const visibleSlugs = getVisibleSlugs(user);

  return (
    <Shell visibleSlugs={visibleSlugs} userName={user.nome}>
      {children}
    </Shell>
  );
}

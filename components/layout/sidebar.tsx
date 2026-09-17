"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronsLeft, ChevronsRight, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav-config";

export function Sidebar({ visibleSlugs }: { visibleSlugs: string[] }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => visibleSlugs.includes(item.slug));

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200 print:hidden md:flex",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center justify-center gap-2 border-b border-sidebar-border px-4">
        {collapsed ? (
          <Leaf className="h-5 w-5 shrink-0 text-primary" />
        ) : (
          <div className="flex items-center rounded-md bg-white px-2 py-1.5 shadow-sm">
            <Image src="/logo-biogreen.jpg" alt="Biogreen" width={104} height={50} className="h-8 w-auto" priority />
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {items.map((item) => {
          const href = `/${item.slug}`;
          const active = pathname === href || (item.slug !== "" && pathname.startsWith(href));
          return (
            <Link
              key={item.slug}
              href={href}
              title={item.label}
              className={cn(
                "mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-sidebar-foreground/80 hover:bg-white/10 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex items-center gap-2 border-t border-sidebar-border px-4 py-3 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground"
      >
        {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        {!collapsed && "Recolher"}
      </button>
    </aside>
  );
}

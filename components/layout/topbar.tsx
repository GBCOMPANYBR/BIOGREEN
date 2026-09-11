"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { CommandPalette } from "@/components/layout/command-palette";

export function Topbar({ userName, visibleSlugs }: { userName: string; visibleSlugs: string[] }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-4">
      <div className="flex-1">
        <CommandPalette visibleSlugs={visibleSlugs} />
      </div>
      <ThemeToggle />
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
            <UserIcon className="h-4 w-4" />
            <span className="max-w-[10rem] truncate">{userName}</span>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="z-50 min-w-[10rem] rounded-md border border-border bg-card p-1 shadow-md"
          >
            <DropdownMenu.Item
              onSelect={logout}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </header>
  );
}

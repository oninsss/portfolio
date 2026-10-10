import { profile } from "@/content";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-5 py-4 sm:px-8">
        <p className="min-w-0 truncate text-sm font-medium text-ink">
          {profile.name}
        </p>

        <div className="ml-auto flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

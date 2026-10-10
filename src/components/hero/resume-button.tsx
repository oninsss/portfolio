import { resumeFile } from "@/content";
import { IconDownload } from "@/components/shared/icons";

const BUTTON = "inline-flex h-10 items-center gap-2 border px-4 text-sm";

export function ResumeButton() {
  if (resumeFile) {
    return (
      <a
        href={resumeFile.href}
        download={resumeFile.filename ?? ""}
        className={`${BUTTON} group border-accent text-accent transition-[background-color,color,translate] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:bg-accent hover:text-canvas`}
      >
        <IconDownload
          size={16}
          className="transition-transform duration-200 group-hover:translate-y-0.5"
        />
        Download résumé
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled
      className={`${BUTTON} cursor-not-allowed border-dashed border-rule text-ink-muted/70`}
    >
      <IconDownload size={16} />
      Résumé · coming soon
    </button>
  );
}

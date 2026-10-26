"use client";

import Image from "next/image";
import { useRef, useState, useSyncExternalStore } from "react";
import type { Project } from "@/content";
import {
  IconArrowUpRight,
  IconPause,
  IconPlay,
} from "@/components/shared/icons";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

type ProjectsProps = {
  items: Project[];
};

function detailFields(project: Project) {
  return [
    { label: "Problem", value: project.detail.problem },
    { label: "My contribution", value: project.detail.built },
    { label: "My role", value: project.detail.role },
    { label: "Technical implementation", value: project.detail.implementation },
  ].filter((field): field is { label: string; value: string } => !!field.value);
}

function ProjectPreviewVideo({
  preview,
  link,
}: {
  preview: NonNullable<Project["preview"]>;
  link?: Project["links"][number];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    prefersReducedMotion,
    () => false,
  );

  const frame = reduced ? (
    <Image
      src={preview.poster ?? preview.src}
      alt={preview.alt}
      width={preview.width}
      height={preview.height}
      quality={90}
      sizes="(max-width: 1024px) 100vw, 44rem"
      className="block h-auto w-full"
    />
  ) : (
    <>
      <video
        ref={videoRef}
        src={preview.src}
        poster={preview.poster}
        width={preview.width}
        height={preview.height}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        tabIndex={-1}
        className="block h-auto w-full"
      />
      <span className="sr-only">{preview.alt}</span>
      <button
        type="button"
        aria-pressed={paused}
        aria-label={paused ? "Play the preview" : "Pause the preview"}
        title={paused ? "Play" : "Pause"}
        onClick={() => {
          const el = videoRef.current;
          if (!el) return;
          if (paused) {
            el.play();
          } else {
            el.pause();
          }
          setPaused((value) => !value);
        }}
        className="absolute bottom-2 left-2 z-10 flex h-7 w-7 cursor-pointer items-center justify-center border border-rule bg-canvas text-ink-muted transition-colors duration-150 hover:text-accent"
      >
        {paused ? <IconPlay size={12} /> : <IconPause size={12} />}
      </button>
    </>
  );

  return (
    <div className="relative mt-5 w-full overflow-hidden border border-rule">
      {frame}
      {link ? (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group/preview absolute bottom-2 right-2 z-10 inline-flex items-center gap-1 border border-rule bg-canvas px-2 py-1 text-xs text-ink-muted transition-colors duration-200 hover:border-accent hover:text-accent"
        >
          {link.label}
          <span className="sr-only">, opens in a new tab</span>
          <IconArrowUpRight size={12} />
        </a>
      ) : null}
    </div>
  );
}

function ProjectPreview({ project }: { project: Project }) {
  const preview = project.preview;
  const link = project.links[0];

  if (preview) {
    if (preview.kind === "video") {
      return <ProjectPreviewVideo preview={preview} link={link} />;
    }

    const image = (
      <Image
        src={preview.src}
        alt={preview.alt}
        width={preview.width}
        height={preview.height}
        quality={90}
        sizes="(max-width: 1024px) 100vw, 44rem"
        className="block h-auto w-full"
      />
    );

    // The first project link (the live demo) is also reachable from the image.
    if (link) {
      return (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group/preview relative mt-5 block w-full overflow-hidden border border-rule transition-colors duration-200 hover:border-accent"
        >
          {image}
          <span className="sr-only">
            {link.label}, opens in a new tab
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-2 right-2 inline-flex items-center gap-1 border border-rule bg-canvas px-2 py-1 text-xs text-ink opacity-0 transition-opacity duration-200 group-hover/preview:opacity-100 group-focus-visible/preview:opacity-100"
          >
            {link.label}
            <IconArrowUpRight size={12} />
          </span>
        </a>
      );
    }

    return (
      <div className="mt-5 w-full overflow-hidden border border-rule">
        {image}
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="relative mt-5 flex aspect-video w-full items-center justify-center border border-rule"
    >
      <span className="pointer-events-none absolute inset-2 border border-dashed border-rule" />
      <span className="relative px-6 text-center">
        <span className="block font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-muted">
          Project preview
        </span>
        <span className="mt-1.5 block text-xs leading-relaxed text-ink-muted">
          Screenshot not added yet.
        </span>
      </span>
    </div>
  );
}

export function Projects({ items }: ProjectsProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ol className="divide-y divide-rule">
      {items.map((project, index) => {
        const open = openId === project.id;
        const panelId = `project-panel-${project.id}`;
        const buttonId = `project-toggle-${project.id}`;
        const fields = detailFields(project);

        return (
          <li key={project.id} className="reveal group py-6 first:pt-0 last:pb-0">
            <article>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
                <div className="min-w-0">
                  <p className="font-mono text-[0.6875rem] tracking-[0.06em] text-ink-muted">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 text-xl font-medium tracking-tight text-ink transition-colors duration-150 group-hover:text-accent sm:text-2xl">
                    {project.name}
                  </h3>
                  <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-ink-muted sm:text-base">
                    {project.summary}
                  </p>
                  <p className="mt-3 font-mono text-xs leading-relaxed text-ink-muted">
                    {project.technologies.join("  ·  ")}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-3 sm:flex-col sm:items-end">
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenId(open ? null : project.id)}
                    className="inline-flex items-center gap-1.5 border border-rule px-3 py-1.5 text-[0.8125rem] text-ink-muted transition-colors duration-200 hover:border-accent hover:text-accent"
                  >
                    <span>{open ? "Hide details" : "View details"}</span>
                    <svg
                      viewBox="0 0 12 12"
                      width="11"
                      height="11"
                      aria-hidden="true"
                      focusable="false"
                      className={`transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        d="M2 4.5 6 8.5 10 4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>

                  {project.links.length > 0 ? (
                    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      {project.links.map((link) => (
                        <li key={link.label}>
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[0.8125rem] text-ink-muted underline decoration-rule underline-offset-4 transition-[color,text-decoration-color,text-underline-offset] duration-200 hover:text-accent hover:decoration-accent hover:underline-offset-2"
                          >
                            {link.label}
                            <span className="sr-only"> (opens in a new tab)</span>
                            <IconArrowUpRight size={13} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>

              <div
                id={panelId}
                className="panel"
                data-open={open ? "true" : "false"}
              >
                <div className="panel-inner">
                  <ProjectPreview project={project} />
                  <div className="mt-5 border-l border-rule pl-4 sm:pl-6">
                    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                      {fields.map((field) => (
                        <div key={field.label}>
                          <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-ink-muted">
                            {field.label}
                          </dt>
                          <dd className="mt-1 text-sm leading-relaxed text-ink">
                            {field.value}
                          </dd>
                        </div>
                      ))}
                      <div className="sm:col-span-2">
                        <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-ink-muted">
                          Technologies
                        </dt>
                        <dd className="mt-1 font-mono text-xs leading-relaxed text-ink">
                          {project.technologies.join("  ·  ")}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}

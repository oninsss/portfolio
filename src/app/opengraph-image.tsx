import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { heroFacts, profile } from "@/content";

export const alt = `${profile.fullName}, ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const robot = await readFile(join(process.cwd(), "src/app/icon.svg"));
const robotSrc = `data:image/svg+xml;base64,${robot.toString("base64")}`;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 72,
          padding: "0 96px",
          background: "#131312",
          color: "#ececea",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={robotSrc} width={288} height={288} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 112,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 1.05,
            }}
          >
            {profile.fullName}
          </div>
          <div style={{ marginTop: 16, fontSize: 48, color: "#a58bf2" }}>
            {profile.role}
          </div>
          {heroFacts.location ? (
            <div style={{ marginTop: 28, fontSize: 30, color: "#989894" }}>
              {heroFacts.location}
            </div>
          ) : null}
        </div>
      </div>
    ),
    size,
  );
}

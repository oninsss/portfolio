import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import { BootScreen } from "@/components/assistant/boot-screen";
import { heroFacts, profile } from "@/content";
import { metadataBase, siteUrl } from "@/lib/site";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = `${profile.fullName} | ${profile.role}`;
const description = [
  `${profile.fullName}, ${profile.role}${heroFacts.location ? ` in ${heroFacts.location}` : ""}.`,
  profile.leadLines[0],
].join(" ");

export const metadata: Metadata = {
  metadataBase,
  title,
  description,
  alternates: siteUrl ? { canonical: "/" } : undefined,
  openGraph: {
    type: "website",
    siteName: profile.fullName,
    title,
    description,
    url: siteUrl ? "/" : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  verification: {
    google: "9jhstaJnMH1nnNXPKKE-vh5iCTFbTv9PZwAx2wT2boQ",
  },
};

const themeInit = `(function(){try{var t=localStorage.getItem("theme");var r=document.documentElement;if(t==="light"||t==="dark"){r.dataset.theme=t}else{delete r.dataset.theme}}catch(e){}})();`;

const openerInit = `(function(){try{var d=document.documentElement;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;if(sessionStorage.getItem("portfolio-opener"))return;d.dataset.opener="run"}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeInit + openerInit }} />
        <BootScreen />
        {children}
      </body>
    </html>
  );
}

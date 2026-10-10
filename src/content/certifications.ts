import type { Certification } from "./types";

export const certifications: Certification[] = [
  {
    id: "ccst-cybersecurity",
    name: "Cisco Certified Support Technician Cybersecurity (CCST Cybersecurity)",
    issuer: "Cisco",
    issued: "Nov 2025",
    expires: "Nov 2030",
    credentialUrl:
      "https://www.credly.com/badges/a30561e7-8563-4e48-b6c2-b1d9e0cfe6e6/public_url",
    badge: "/badges/ccst-cybersecurity-circle.png",
  },
  {
    id: "it-specialist-javascript",
    name: "IT Specialist - JavaScript",
    issuer: "Certiport - A Pearson VUE Business",
    issued: "Nov 2025",
    expires: "Nov 2030",
    credentialUrl:
      "https://www.credly.com/badges/127679a4-4274-4d36-9958-7a8ae7503897/public_url",
    badge: "/badges/it-specialist-javascript.png",
  },
  {
    id: "cyberops-associate",
    name: "CyberOps Associate",
    issuer: "Cisco",
    issued: "Nov 2025",
    credentialUrl:
      "https://www.credly.com/badges/ab21c306-7566-442c-9d07-ce6461d9d2ec/public_url",
    badge: "/badges/cyberops-associate.png",
  },
  {
    id: "pmi-project-management-ready",
    name: "PMI Project Management Ready™",
    issuer: "Project Management Institute",
    issued: "Mar 2025",
    credentialUrl:
      "https://www.credly.com/badges/2b7bd4d7-2cb6-4c20-8eb3-6659859be153/public_url",
    badge: "/badges/pmi-project-management-ready.png",
  },
  {
    id: "devnet-associate",
    name: "DevNet Associate",
    issuer: "Cisco",
    issued: "Mar 2025",
    credentialUrl:
      "https://www.credly.com/badges/bf719413-efca-4811-90ea-10cc9ca9784d/public_url",
    badge: "/badges/devnet-associate.png",
  },
  {
    id: "ccna-enterprise-networking",
    name: "CCNA: Enterprise Networking, Security, and Automation",
    issuer: "Cisco",
    issued: "Jan 2025",
    credentialUrl:
      "https://www.credly.com/badges/d8b030b4-ccd4-4b65-8713-bb79fdc84ec9/public_url",
    badge: "/badges/ccna-enterprise-networking-security-and-automation.png",
  },
  {
    id: "ccna-srw",
    name: "CCNA: Switching, Routing, and Wireless Essentials",
    issuer: "Cisco",
    issued: "Jul 2024",
    credentialUrl:
      "https://www.credly.com/badges/ee8e439e-5fdc-4de9-b231-f2745c50383e/public_url",
    badge: "/badges/ccna-switching-routing-and-wireless-essentials.1.png",
  },
  {
    id: "ccna-itn",
    name: "CCNA: Introduction to Networks",
    issuer: "Cisco",
    issued: "Mar 2024",
    credentialUrl:
      "https://www.credly.com/badges/75acc2cb-e73a-4c39-a2ee-49ae67c1a587/public_url",
    badge: "/badges/ccna-introduction-to-networks.png",
  },
  {
    id: "it-specialist-networking",
    name: "IT Specialist - Networking",
    issuer: "Certiport - A Pearson VUE Business",
    issued: "Jul 2024",
    credentialUrl:
      "https://www.credly.com/badges/16996c55-fe81-4878-b46a-107d41ec9c73/public_url",
    badge: "/badges/it-specialist-networking.png",
  },
  {
    id: "it-specialist-python",
    name: "IT Specialist - Python",
    issuer: "Certiport - A Pearson VUE Business",
    issued: "Mar 2024",
    credentialUrl:
      "https://www.credly.com/badges/d1c1da99-ec9b-4125-8049-308ec7f6d86c/public_url",
    badge: "/badges/it-specialist-python.png",
  },
  {
    id: "it-specialist-html-css",
    name: "IT Specialist - HTML and CSS",
    issuer: "Certiport - A Pearson VUE Business",
    issued: "Nov 2024",
    credentialUrl:
      "https://www.credly.com/badges/aadc1f6a-0a1f-4f6c-b3cd-23783e25c96d/public_url",
    badge: "/badges/it-specialist-html-and-css.png",
  },
];

const issuerMarks: Record<string, string> = {
  Cisco: "CSC",
  "Certiport - A Pearson VUE Business": "CPT",
  "Project Management Institute": "PMI",
};

export function issuerMark(issuer: string): string {
  const known = issuerMarks[issuer];
  if (known) return known;
  const letters = issuer.replace(/[^A-Za-z ]/g, "").trim();
  return (letters.split(" ").map((word) => word[0]).join("") || "?")
    .slice(0, 3)
    .toUpperCase();
}

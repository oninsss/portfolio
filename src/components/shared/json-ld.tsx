import { heroFacts, heroLinks, profile, skills } from "@/content";
import { siteUrl } from "@/lib/site";

export function JsonLd() {
  const sameAs = heroLinks.flatMap((link) => (link.href ? [link.href] : []));
  const knowsAbout = skills.flatMap((group) => group.items);

  const person = {
    "@type": "Person",
    "@id": siteUrl ? `${siteUrl.origin}/#person` : undefined,
    name: profile.fullName,
    alternateName: profile.name,
    jobTitle: profile.role,
    url: siteUrl?.origin,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    knowsAbout: knowsAbout.length > 0 ? knowsAbout : undefined,
    homeLocation: heroFacts.location
      ? { "@type": "Place", name: heroFacts.location }
      : undefined,
  };

  const website = siteUrl
    ? {
        "@type": "WebSite",
        "@id": `${siteUrl.origin}/#website`,
        name: profile.fullName,
        url: siteUrl.origin,
        publisher: { "@id": `${siteUrl.origin}/#person` },
      }
    : undefined;

  const graph = {
    "@context": "https://schema.org",
    "@graph": website ? [person, website] : [person],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, "\\u003c"),
      }}
    />
  );
}

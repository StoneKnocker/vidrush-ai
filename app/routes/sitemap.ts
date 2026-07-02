import { env } from "cloudflare:workers";
import { buildSitemapXml, getSitemapEntries } from "~/lib/sitemap";

export async function loader() {
  const entries = await getSitemapEntries(env.APP_URL);
  const xml = buildSitemapXml(entries);

  return new Response(xml, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/legal"] },
    sitemap: "https://shieldprop.io/sitemap.xml",
    host: "https://shieldprop.io",
  };
}

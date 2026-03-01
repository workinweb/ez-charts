import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;

  const routes = [
    "",
    "/examples",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/opinions",
    "/ezcharts",
    "/ezcharts/charts",
    "/ezcharts/slides",
    "/ezcharts/favorites",
    "/ezcharts/edit",
    "/ezcharts/examples",
    "/ezcharts/credits",
    "/ezcharts/user",
    "/sign-in",
    "/sign-up",
  ];

  return routes.map((route) => ({
    url: `${base}${route || "/"}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : ("weekly" as const),
    priority: route === "" ? 1 : route.startsWith("/ezcharts") ? 0.9 : 0.7,
  }));
}

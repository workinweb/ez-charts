import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/ezcharts/user/",
          "/ezcharts/charts/",
          "/ezcharts/edit",
          "/sign-in",
          "/sign-up",
          "/reset-password",
          "/forgot-password",
          "/present/",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
        disallow: [
          "/ezcharts/user/",
          "/ezcharts/charts/",
          "/ezcharts/edit",
          "/sign-in",
          "/sign-up",
          "/reset-password",
          "/forgot-password",
          "/present/",
        ],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/ezcharts/user/",
          "/ezcharts/charts/",
          "/ezcharts/edit",
          "/sign-in",
          "/sign-up",
          "/reset-password",
          "/forgot-password",
          "/present/",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}

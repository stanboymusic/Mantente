import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://mantente-blog.vercel.app"; // Replace with actual domain

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [], // Add any paths to disallow if needed
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
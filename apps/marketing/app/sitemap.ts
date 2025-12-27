import type { MetadataRoute } from "next";
import { site } from "../content/site";

const routes = ["", "/product", "/about", "/contact", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${site.baseUrl}${route}`,
    lastModified
  }));
}

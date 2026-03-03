import type { MetadataRoute } from "next";
import { getCatalogGames } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const games = await getCatalogGames();

  const gameRoutes = games.map((game) => ({
    url: `${baseUrl}/game/${game.slug}`,
    lastModified: new Date(),
  }));

  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/search`, lastModified: new Date() },
    { url: `${baseUrl}/signin`, lastModified: new Date() },
    { url: `${baseUrl}/signup`, lastModified: new Date() },
    ...gameRoutes,
  ];
}

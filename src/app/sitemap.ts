import type { MetadataRoute } from "next";
import { getProductRepository } from "@/lib/data";
import { getSpaceRepository } from "@/lib/data/space-repository";
import { getSceneRepository } from "@/lib/data/scene-repository";
import { mainNavigation } from "@/lib/navigation-data";
import { getSiteUrl, localePath, staticContentPaths } from "@/lib/site-config";
import { routing } from "@/i18n/routing";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    entries.push({
      url: `${siteUrl}${localePath(locale, "/")}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${siteUrl}${localePath(l, "/")}`]),
        ),
      },
    });

    for (const path of staticContentPaths) {
      entries.push({
        url: `${siteUrl}${localePath(locale, path)}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: path.startsWith("/policies") ? 0.4 : 0.6,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${siteUrl}${localePath(l, path)}`]),
          ),
        },
      });
    }

    const categorySlugs = mainNavigation.flatMap((item) => [
      item.slug,
      ...(item.children?.map((c) => c.slug) ?? []),
    ]);

    for (const slug of categorySlugs) {
      const path = `/categories/${slug}`;
      entries.push({
        url: `${siteUrl}${localePath(locale, path)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  const productSlugs = await getProductRepository().getAllSlugs();
  for (const slug of productSlugs) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${siteUrl}${localePath(locale, `/products/${slug}`)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  const spaceSlugs = await getSpaceRepository().getAllSlugs();
  for (const slug of spaceSlugs) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${siteUrl}${localePath(locale, `/spaces/${slug}`)}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  const sceneSlugs = await getSceneRepository().getAllSlugs();
  for (const slug of sceneSlugs) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${siteUrl}${localePath(locale, `/scenes/${slug}`)}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}

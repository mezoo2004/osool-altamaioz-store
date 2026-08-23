import { NextResponse } from "next/server";
import { runVisualSearch } from "@/lib/visual-search/visual-search-service";
import type { VisualAttributes } from "@/lib/visual-search/types";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let locale: "ar" | "en" = "ar";
    let query = "";
    let attributes: VisualAttributes | undefined;
    let imageBuffer: Buffer | undefined;
    let imageMime: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      locale = form.get("locale") === "en" ? "en" : "ar";
      query = String(form.get("query") ?? form.get("q") ?? "").trim();
      const attrRaw = form.get("attributes");
      if (typeof attrRaw === "string" && attrRaw) {
        attributes = JSON.parse(attrRaw) as VisualAttributes;
      }
      const file = form.get("image");
      if (file instanceof File && file.size > 0) {
        imageBuffer = Buffer.from(await file.arrayBuffer());
        imageMime = file.type || undefined;
      }
    } else {
      const body = (await request.json()) as {
        locale?: string;
        query?: string;
        attributes?: VisualAttributes;
      };
      locale = body.locale === "en" ? "en" : "ar";
      query = body.query?.trim() ?? "";
      attributes = body.attributes;
    }

    if (!imageBuffer && !attributes?.productType && !query) {
      return NextResponse.json({ error: "image_or_query_required" }, { status: 400 });
    }

    const result = await runVisualSearch({
      locale,
      query,
      attributes,
      imageBuffer,
      imageMime,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "visual_search_failed" }, { status: 500 });
  }
}

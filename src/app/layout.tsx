import type { Metadata } from "next";
import { buildRootMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildRootMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

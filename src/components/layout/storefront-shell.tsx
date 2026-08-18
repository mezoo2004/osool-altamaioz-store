import { StorefrontShellClient } from "@/components/layout/storefront-shell-client";

type StorefrontShellProps = {
  locale: "ar" | "en";
  children: React.ReactNode;
};

export function StorefrontShell({ locale, children }: StorefrontShellProps) {
  return <StorefrontShellClient locale={locale}>{children}</StorefrontShellClient>;
}

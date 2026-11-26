import "./globals.css";
import { getCanonicalSiteUrl } from "@/lib/site-url.mjs";

const siteUrl = getCanonicalSiteUrl();

export const metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: "FrontendForge Studio 3.5 | Client Website Production Workspace",
  description: "FrontendForge Studio: choose reusable website starters, customize client branding, generate independent client websites and manage project releases.",
  icons: { icon: "/icon.svg" },
  openGraph: { title: "FrontendForge", description: "Six editable small-business website starters and a reusable frontend component system.", images: ["/opengraph-image.png"], type: "website" },
  twitter: { card: "summary_large_image", title: "FrontendForge", description: "Reusable small-business website systems." }
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
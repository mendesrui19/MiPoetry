import type { Metadata, Viewport } from "next";
import {
  Caveat,
  Cormorant_Garamond,
  Crimson_Pro,
  Dancing_Script,
  DM_Sans,
  EB_Garamond,
  IBM_Plex_Mono,
  Libre_Baskerville,
  Literata,
  Lora,
  Merriweather,
  Permanent_Marker,
  Playfair_Display,
  Satisfy,
  Source_Serif_4,
} from "next/font/google";
import { AppBackground } from "@/components/layout/app-background";
import { CloudSyncProvider } from "@/components/providers/cloud-sync-provider";
import { ServiceWorkerRegister } from "@/components/providers/sw-register";
import { StoreHydration } from "@/components/providers/store-provider";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { OnlineProvider } from "@/components/providers/online-provider";
import { PushProvider } from "@/components/providers/push-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const crimson = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const satisfy = Satisfy({
  variable: "--font-satisfy",
  subsets: ["latin"],
  weight: ["400"],
});

const permanentMarker = Permanent_Marker({
  variable: "--font-permanent-marker",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "MiPoetry — Rede Social de Poemas",
  description:
    "Escreve, partilha e descobre poemas. Uma comunidade de poesia mobile-first.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MiPoetry",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#fafaf9",
  viewportFit: "cover",
};

const fontVariables = [
  dmSans.variable,
  literata.variable,
  ibmMono.variable,
  playfair.variable,
  lora.variable,
  merriweather.variable,
  libreBaskerville.variable,
  ebGaramond.variable,
  cormorant.variable,
  crimson.variable,
  sourceSerif.variable,
  caveat.variable,
  dancingScript.variable,
  satisfy.variable,
  permanentMarker.variable,
].join(" ");

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt"
      className={`${fontVariables} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-paper text-ink" suppressHydrationWarning>
        <AppBackground>
          <StoreHydration />
          <SupabaseProvider />
          <CloudSyncProvider />
          <OnlineProvider />
          <PushProvider />
          <ServiceWorkerRegister />
          <ToastProvider />
          {children}
        </AppBackground>
      </body>
    </html>
  );
}

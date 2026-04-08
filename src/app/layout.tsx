import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import { ThemeScript } from "@/components/ThemeScript";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND_NAME} · Pádel`,
    template: `%s · ${BRAND_NAME}`,
  },
  description: `${BRAND_TAGLINE}. Torneo americano: parejas al azar, puntos individuales.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${bebas.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full">
        <div className="page-shell">{children}</div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Sans } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import "./liquid.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "600"],
  style: ["normal"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600"],
  style: ["normal"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "127.0.0.1:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("127.0.0.1") || host.startsWith("localhost")
      ? "http"
      : "https");
  const origin = `${protocol}://${host}`;
  const title = "TĨNH — Spa Commerce";
  const description =
    "Mua mỹ phẩm, chọn thiết bị và đặt lịch tư vấn hoặc liệu trình trong cùng một hồ sơ chăm sóc da.";

  return {
    metadataBase: new URL(origin),
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "vi_VN",
      images: [
        {
          url: `${origin}/og.png`,
          width: 1200,
          height: 630,
          alt: "TĨNH — Mỹ phẩm và liệu trình trong một hồ sơ da",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${cormorant.variable} ${ibmPlexSans.variable}`}>
        {children}
      </body>
    </html>
  );
}

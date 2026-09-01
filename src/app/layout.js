import { Geist_Mono, Inter, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "TradeLink — Retail Network Platform",
    template: "%s | TradeLink",
  },
  description: "TradeLink connects shop owners, suppliers, and delivery partners in a seamless retail network. Manage inventory, process orders, and grow your business.",
  keywords: ["trade", "retail", "inventory", "supplier", "shop owner", "delivery", "B2B", "ecommerce"],
  authors: [{ name: "TradeLink Team" }],
  creator: "TradeLink",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "TradeLink",
    title: "TradeLink — Retail Network Platform",
    description: "Connect with suppliers, manage inventory, and streamline your retail operations.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TradeLink — Retail Network Platform",
    description: "Connect with suppliers, manage inventory, and streamline your retail operations.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

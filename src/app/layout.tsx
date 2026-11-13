import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ShopProvider } from "@/context/ShopContext";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import ProductModal from "@/components/ProductModal";
import RollUpDoorLoader from "@/components/RollUpDoorLoader";

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "ReGear Thrift Shop | 1-of-1 Streetwear & Vintage Archive",
  description:
    "Curated 1-of-1 streetwear, racing jackets, vintage box tees, and archive workwear in the Philippines. Graded, measured, and claimed via Facebook Messenger.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${jakarta.variable} ${mono.variable}`}
    >
      <body className="font-sans antialiased bg-canvas text-ink selection:bg-ink selection:text-canvas">
        <ShopProvider>
          <RollUpDoorLoader />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <ProductModal />
          <CartDrawer />
        </ShopProvider>
      </body>
    </html>
  );
}

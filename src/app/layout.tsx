import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/query";

const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "TeesZone Admin", template: "%s · TeesZone Admin" },
  description: "TeesZone back office — catalog, pricing, promotions, content and leads.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${poppins.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

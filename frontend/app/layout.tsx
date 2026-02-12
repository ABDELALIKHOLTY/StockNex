import type { Metadata } from "next";

import "./globals.css";
import "../styles/stockheatmap.css";
import RootLayoutClient from "./RootLayoutClient";

export const metadata: Metadata = {
  title: "Stock Nex",
  description: "a forcast app for stock market",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}

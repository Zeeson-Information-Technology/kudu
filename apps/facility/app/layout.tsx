import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kudu Facility",
  description: "Kudu Health Facility App",
  icons: {
    icon: "/favicon-96x96.png"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

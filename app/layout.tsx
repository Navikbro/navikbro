import type { Metadata, Viewport } from "next";
import "./globals.css";

import { AuthProvider } from "@/app/context/AuthContext";
import InitialLoader from "@/components/InitialLoader";
export const metadata: Metadata = {
  title: "NAVIK",
  description: "Sail Towards COC",

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A2540",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <InitialLoader>
            {children}
          </InitialLoader>
        </AuthProvider>
      </body>
    </html>
  );
}
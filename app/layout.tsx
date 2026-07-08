import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext";
import InitialLoader from "@/components/InitialLoader";
export const metadata: Metadata = {
  title: "Navik",
  description: "Sail Towards COC",
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
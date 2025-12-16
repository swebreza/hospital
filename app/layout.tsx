import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/Layout/AppLayout";
import { Toaster } from 'sonner';
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "BME-AMS | Cybrox Solutions",
  description: "Biomedical Equipment Asset Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster position="top-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}

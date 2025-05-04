import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CompanyProvider } from "@/context/CompanyContext";
import SupabaseProvider from "@/context/SupabaseProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ContractLens - AI-Powered Contract Management",
  description: "Powerful contract management dashboard powered by artificial intelligence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen bg-white`}>
        <SupabaseProvider>
          <AuthProvider>
            <CompanyProvider>
              {children}
              <Toaster />
            </CompanyProvider>
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}

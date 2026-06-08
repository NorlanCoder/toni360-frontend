import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Toni360 - Plateforme de commande de médicaments",
  description: "Accédez rapidement à vos médicaments ou rejoignez notre réseau de pharmacies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  }>) {
  return (
    <html lang="fr" className={montserrat.variable}>
      <head />
      <body className="font-sans antialiased">
        <Toaster position="top-right" richColors closeButton />
        {children}
      </body>
    </html>
  );
}

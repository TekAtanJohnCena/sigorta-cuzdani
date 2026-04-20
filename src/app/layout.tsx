import type { Metadata } from "next";
import { AuthProvider } from "@/lib/firebase/AuthContext";
import "./globals.css";
import "../styles/components.css";

export const metadata: Metadata = {
  title: "Sigorta Cüzdanı — Kurumsal Sigorta Yönetim Platformu",
  description:
    "Şirketinizin tüm sigorta poliçelerini tek ekranda yönetin. PDF yükleyin, AI analiz etsin. Vade takibi, nakit akış analizi ve risk yönetimi.",
  keywords: [
    "sigorta yönetimi",
    "poliçe takibi",
    "kurumsal sigorta",
    "B2B sigorta",
    "sigorta cüzdanı",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

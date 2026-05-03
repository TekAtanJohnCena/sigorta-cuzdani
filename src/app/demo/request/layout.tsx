import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Demo Talep Et",
  description: "Sigorta Cüzdanı platformunu ücretsiz deneyin. Şirketinize özel demo için formu doldurun, ekibimiz 24 saat içinde sizinle iletişime geçsin.",
  openGraph: {
    title: "Demo Talep Et - Sigorta Cüzdanı",
    description: "Kurumsal sigorta yönetim platformumuzu ücretsiz deneyin. Form doldurun, 24 saat içinde demo hesabınız hazır.",
  },
};

export default function DemoRequestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

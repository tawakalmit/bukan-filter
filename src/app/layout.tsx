import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#e67e22',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Bukan Sekadar Filter — Studio Foto Profil Sadar Karhutla',
  description:
    'Satu foto profil, seribu suara untuk langit kita. Buat foto profil bernuansa kabut asap untuk menjaga kesadaran karhutla dan hak atas udara bersih tetap hidup di linimasa.',
  keywords: [
    'karhutla',
    'bukan filter',
    'foto profil karhutla',
    'haze avatar',
    'udara bersih',
    'duotone studio',
    'solidaritas lingkungan',
  ],
  authors: [{ name: 'Studio Sadar Karhutla' }],
  openGraph: {
    title: 'Bukan Sekadar Filter — Studio Foto Profil Sadar Karhutla',
    description:
      'Pasang pengingat di foto profilmu. Langit jingga pekat bukan estetika, kawal hak udara bersih bersama.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full scroll-smooth">
      <head>
        <link rel="icon" href="/assets/icon.webp" type="image/webp" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}

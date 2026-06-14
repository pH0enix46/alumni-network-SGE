import { Rubik } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  metadataBase: new URL("https://admin.shabujglobal.com"),
  title: "Shabuj Global Admin Panel",
  description:
    "Secure administration dashboard and management portal for Shabuj Global.",
  keywords: [
    "Shabuj Global",
    "Admin Panel",
    "Dashboard",
    "Management",
    "Portal",
    "Secure Portal",
  ],
  authors: [{ name: "Shabuj Global" }],

  openGraph: {
    title: "Shabuj Global Admin Panel",
    description:
      "Secure administration dashboard and management portal for Shabuj Global.",
    url: "https://admin.shabujglobal.com",
    siteName: "Shabuj Global Admin",
    images: [
      {
        url: "/logo.avif",
        width: 1200,
        height: 630,
        alt: "Shabuj Global Admin Panel",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Shabuj Global Admin Panel",
    description:
      "Secure administration dashboard and management portal for Shabuj Global.",
    images: ["/logo.avif"],
  },
  icons: {
    icon: "/logo.avif",
    shortcut: "/logo.avif",
    apple: "/logo.avif",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rubik.variable} h-dvh antialiased`}>
      <body className="min-h-dvh overflow-x-hidden! dark bg-bg-primary">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "InvoiceChaser — autonomous accounts-receivable agent",
  description:
    "An autonomous AR collection agent for SMEs: senses the ledger, reasons about each customer, acts where pre-approved, and escalates where it matters.",
  openGraph: {
    title: "InvoiceChaser — autonomous accounts-receivable agent",
    description: "Minimise overdue receivables without damaging customer relationships.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body>{children}</body>
    </html>
  );
}

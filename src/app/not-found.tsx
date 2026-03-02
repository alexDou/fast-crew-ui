import Link from "next/link";

import { Geist } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

export default function NotFound() {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans`}>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <h2 className="font-bold text-2xl">Not Found</h2>
          <p className="text-muted-foreground">Could not find the requested resource.</p>
          <Link href="/" className="text-primary hover:underline">
            Return Home
          </Link>
        </div>
      </body>
    </html>
  );
}

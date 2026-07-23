import Link from "next/link";

import { IBM_Plex_Sans } from "next/font/google";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

export default function NotFound() {
  return (
    <html lang="en">
      <body
        className={`${plexSans.variable} font-sans flex min-h-screen w-full flex-col antialiased`}
      >
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

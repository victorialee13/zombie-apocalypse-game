import type { Metadata } from "next";
import { Bellefair, Freckle_Face, Share_Tech_Mono, Varela_Round } from "next/font/google";
import type { ReactNode } from "react";
import BrightnessSync from "../components/BrightnessSync";
import MusicSync from "../components/MusicSync";
import "./globals.css";

const bellefair = Bellefair({ weight: "400", subsets: ["latin"], variable: "--font-bellefair" });
const freckleFace = Freckle_Face({ weight: "400", subsets: ["latin"], variable: "--font-freckle-face" });
const shareTechMono = Share_Tech_Mono({ weight: "400", subsets: ["latin"], variable: "--font-share-tech-mono" });
const varelaRound = Varela_Round({ weight: "400", subsets: ["latin"], variable: "--font-varela-round" });

export const metadata: Metadata = {
  title: "Zombie Apocalypse Game",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const fonts = [bellefair, freckleFace, shareTechMono, varelaRound].map((f) => f.variable).join(" ");

  return (
    <html lang="en" className={fonts}>
      <body>
        <BrightnessSync />
        <MusicSync />
        {children}
      </body>
    </html>
  );
}

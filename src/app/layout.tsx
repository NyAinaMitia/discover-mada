import { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import React from "react";

// --- Déclaration des polices Google ---
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- Métadonnées de la page ---
export const metadata: Metadata = {
  title: "Voyage Intelligent - Madagascar",
  description:
    "Découvrez les merveilles de Madagascar grâce à une carte interactive et intelligente.",
};

// --- Typage des props du layout ---
interface RootLayoutProps {
  children: ReactNode;
}

// --- Layout principal ---
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

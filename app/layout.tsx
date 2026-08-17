import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "O Mandarim · 交互叙事",
  description: "根据Eça de Queirós《O Mandarim》改编：一只铃、一笔巨款与一场无法完成的赎罪之旅。",
  openGraph: {
    title: "O Mandarim · TI-LI-TIM",
    description: "一只铃、一笔巨款与一场无法完成的赎罪之旅。",
    type: "website",
    locale: "zh_CN",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "O Mandarim 交互叙事封面" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "O Mandarim · TI-LI-TIM",
    description: "根据Eça de Queirós小说改编的交互叙事。",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

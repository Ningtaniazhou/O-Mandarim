import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "《满大人》· 交互叙事",
  description: "根据埃萨·德·凯罗斯《满大人》改编：一只铃、一笔巨款与一场无法完成的赎罪之旅。",
  openGraph: {
    title: "《满大人》· 交互叙事",
    description: "一只铃、一笔巨款与一场无法完成的赎罪之旅。",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary",
    title: "《满大人》· 交互叙事",
    description: "根据埃萨·德·凯罗斯小说改编的交互叙事。",
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

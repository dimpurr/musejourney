import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MuseJourney - 交互式乐理教程",
  description: "专注于和声学等音乐理论知识的交互式乐理教程平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <header className="bg-blue-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <div className="text-xl font-bold">MuseJourney</div>
            <nav>
              <ul className="flex space-x-4">
                <li><Link href="/" className="hover:underline">首页</Link></li>
                <li><Link href="/courses" className="hover:underline">课程</Link></li>
                <li><Link href="/tools" className="hover:underline">工具</Link></li>
                <li><Link href="/about" className="hover:underline">关于</Link></li>
              </ul>
            </nav>
          </div>
        </header>
        {children}
        <footer className="bg-gray-100 p-4 mt-8">
          <div className="container mx-auto text-center text-gray-600">
            <p>© {new Date().getFullYear()} MuseJourney - 交互式乐理教程</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

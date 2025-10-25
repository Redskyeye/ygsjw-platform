import '../styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '史诗AI - 职业规划师平台',
  description: 'AI驱动的职业规划与指导平台',
  keywords: ['AI', '职业规划', '指导', '发展'],
  authors: [{ name: 'Epic AI Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}

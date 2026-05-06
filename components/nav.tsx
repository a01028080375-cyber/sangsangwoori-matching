"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/register", label: "프로필 등록" },
  { href: "/recommendations", label: "추천 일자리" },
  { href: "/admin", label: "담당자 대시보드" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 max-w-4xl flex items-center justify-between h-16">
        <Link href="/" className="text-2xl font-bold text-gray-900 tracking-tight">
          상상우리
        </Link>
        <nav className="flex gap-2">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-lg text-lg font-medium transition-colors ${
                pathname === href
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

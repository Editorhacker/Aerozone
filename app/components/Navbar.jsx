"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  // Check if we are on the PDF page
  const isPdfPage = pathname === "/pdf-page";

  return (
    <header
      className={`fixed top-0 left-0 w-full flex text-white justify-between items-center px-8 py-6 z-30 transition-colors duration-500 
        ${
          isPdfPage
            ? "bg-gradient-to-r from-emerald-500 to-emerald-900"
            : "bg-tranparent"
        }`}
    >
      <Link href="/">
        <h1 className="text-2xl font-serif font-bold">Aerospace</h1>
      </Link>

      <nav className="flex gap-8 text-lg">
        <Link
          href="/"
          className="px-4 py-1 font-bold border border-white rounded-full text-sm hover:bg-white hover:text-black transition"
        >
          Home
        </Link>
        <Link
          href="/event"
          className="px-4 py-1 font-bold border border-white rounded-full text-sm hover:bg-white hover:text-black transition"
        >
          Events
        </Link>
        <Link
          href="/pdf-page"
          className="px-4 py-1 font-bold border border-white rounded-full text-sm hover:bg-white hover:text-black transition"
        >
          PDF
        </Link>
        <Link
          href="#contact"
          className="px-4 py-1 font-bold border border-white rounded-full text-sm hover:bg-white hover:text-black transition"
        >
          Contact
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;

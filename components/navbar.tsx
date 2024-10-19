'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white">
      <div className=" mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <svg viewBox="0 0 64 36" xmlns="http://www.w3.org/2000/svg" className="h-8 w-14 mr-2">
                <path
                  fill="black"
                  d="M41.3111 0H37.6444C30.3111 0 24.6889 4.15556 21.7556 9.28889C18.8222 3.91111 12.9556 0 5.86667 0H2.2C0.977781 0 0 0.977779 0 2.2V5.86667C0 16.1333 8.31111 24.2 18.3333 24.2H19.8V33C19.8 34.2222 20.7778 35.2 22 35.2C23.2222 35.2 24.2 34.2222 24.2 33V24.2H25.6667C35.6889 24.2 44 16.1333 44 5.86667V2.2C43.5111 0.977779 42.5333 0 41.3111 0ZM19.3111 19.5556H17.8444C10.2667 19.5556 4.15556 13.4444 4.15556 5.86667V4.4H5.62222C13.2 4.4 19.3111 10.5111 19.3111 18.0889V19.5556ZM39.1111 5.86667C39.1111 13.4444 33 19.5556 25.4222 19.5556H23.9556V18.0889C23.9556 10.5111 30.0667 4.4 37.6444 4.4H39.1111V5.86667Z"
                />
              </svg>
              <span className="font-bold text-xl">PDF.ai</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/pricing" className="hover:underline">
              Pricing
            </Link>
            <Link href="/chrome-extension" className="hover:underline">
              Chrome extension
            </Link>
            <Link href="/use-cases" className="hover:underline">
              Use cases
            </Link>
            <Link href="/auth/sign-in" className="hover:underline">
              Get started →
            </Link>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/pricing" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
              Pricing
            </Link>
            <Link
              href="/chrome-extension"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
            >
              Chrome extension
            </Link>
            <Link href="/use-cases" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
              Use cases
            </Link>
            <Link href="/auth/sign-in" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
              Get started →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

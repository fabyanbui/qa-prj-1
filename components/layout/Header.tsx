'use client';

import Link from 'next/link';
import { User as UserIcon, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/store/auth-context';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const { activeSession, logout } = useAuth();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isBuyer = activeSession?.user.roles.includes('BUYER');
  const isSeller = activeSession?.user.roles.includes('SELLER');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-amber-600 sm:text-2xl">
          ShopPy
        </Link>

        <nav className="hidden items-center gap-4 text-sm font-medium text-gray-700 md:flex">
          <Link href="/requests" className="hover:text-amber-600">
            Browse Requests
          </Link>

          {isBuyer && (
            <>
              <Link href="/requests/new" className="hover:text-amber-600">
                Create Request
              </Link>
              <Link href="/my-requests" className="hover:text-amber-600">
                My Requests
              </Link>
            </>
          )}

          {isSeller && <Link href="/my-offers" className="hover:text-amber-600">My Offers</Link>}

          {activeSession && <Link href="/orders" className="hover:text-amber-600">My Orders</Link>}
          {activeSession && <Link href="/messages" className="hover:text-amber-600">Messages</Link>}
          {activeSession && <Link href="/notifications" className="hover:text-amber-600">Notifications</Link>}
          {activeSession && <Link href="/profile" className="hover:text-amber-600">Profile</Link>}
          {activeSession?.user.isAdmin && <Link href="/admin" className="hover:text-amber-600">Admin</Link>}
        </nav>

        <div className="flex items-center gap-3">
          {!activeSession && (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-500"
              >
                Sign up
              </Link>
            </div>
          )}

          {activeSession && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsAccountOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 p-1 pr-3 transition-colors hover:bg-gray-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <UserIcon className="h-5 w-5" />
                </div>
                <span className="max-w-[110px] truncate text-sm font-medium text-gray-700">
                  {activeSession.user.profile.displayName}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    isAccountOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isAccountOpen && (
                <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl bg-white p-2 shadow-2xl ring-1 ring-black/5">
                  <div className="rounded-lg bg-amber-50 px-3 py-3">
                    <p className="text-sm font-semibold text-amber-800">
                      {activeSession.user.profile.displayName}
                    </p>
                    <p className="text-xs text-amber-700">{activeSession.user.email}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {activeSession.user.roles.map((role) => (
                        <span
                          key={role}
                          className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-2 border-t border-gray-100 pt-2">
                    <button
                      onClick={() => {
                        logout();
                        setIsAccountOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                        <LogOut className="h-4 w-4" />
                      </div>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

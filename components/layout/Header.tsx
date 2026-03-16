'use client';

import Link from 'next/link';
import { User as UserIcon, Plus, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/store/auth-context';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const { sessions, activeSession, switchAccount, logout } = useAuth();
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
        <Link href="/" className="text-xl font-bold text-indigo-600 sm:text-2xl">
          ReverseMarket
        </Link>

        <nav className="hidden items-center gap-4 text-sm font-medium text-gray-700 md:flex">
          <Link href="/requests" className="hover:text-indigo-600">
            Browse Requests
          </Link>

          {isBuyer && (
            <>
              <Link href="/requests/new" className="hover:text-indigo-600">
                Create Request
              </Link>
              <Link href="/my-requests" className="hover:text-indigo-600">
                My Requests
              </Link>
            </>
          )}

          {isSeller && <Link href="/my-offers" className="hover:text-indigo-600">My Offers</Link>}

          {activeSession && <Link href="/orders" className="hover:text-indigo-600">My Orders</Link>}
          {activeSession && <Link href="/messages" className="hover:text-indigo-600">Messages</Link>}
          {activeSession && <Link href="/notifications" className="hover:text-indigo-600">Notifications</Link>}
          {activeSession && <Link href="/profile" className="hover:text-indigo-600">Profile</Link>}
          {activeSession?.user.isAdmin && <Link href="/admin" className="hover:text-indigo-600">Admin</Link>}
        </nav>

        <div className="flex items-center gap-3">
          {!activeSession && (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Sign up
              </Link>
            </div>
          )}

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsAccountOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 p-1 pr-3 transition-colors hover:bg-gray-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <UserIcon className="h-5 w-5" />
              </div>
              <span className="max-w-[110px] truncate text-sm font-medium text-gray-700">
                {activeSession ? activeSession.user.profile.displayName : 'Account'}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform ${
                  isAccountOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isAccountOpen && (
              <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl bg-white p-2 shadow-2xl ring-1 ring-black/5">
                {sessions.length > 0 ? (
                  <>
                    <div className="mb-2 px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Accounts
                      </p>
                    </div>

                    <div className="space-y-1">
                      {sessions.map((session) => (
                        <div
                          key={session.user.email}
                          className={`group flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                            activeSession?.user.email === session.user.email
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <button
                            onClick={() => {
                              switchAccount(session.user.email);
                              setIsAccountOpen(false);
                            }}
                            className="flex flex-1 items-center gap-3 text-left"
                          >
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                                activeSession?.user.email === session.user.email
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-200 text-gray-600'
                              }`}
                              >
                                {session.user.profile.displayName.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold">
                                  {session.user.profile.displayName}
                                </span>
                                <span className="text-xs text-gray-400">{session.user.email}</span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {session.user.roles.map((role) => (
                                  <span
                                    key={role}
                                    className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-indigo-700"
                                  >
                                    {role}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </button>

                          <button
                            onClick={() => logout(session.user.email)}
                            className="ml-2 hidden p-1 text-gray-400 hover:text-red-500 group-hover:block"
                            aria-label={`Log out ${session.user.email}`}
                          >
                            <LogOut className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
                    No active sessions yet.
                  </div>
                )}

                <div className="mt-2 border-t border-gray-100 pt-2">
                  <Link
                    href="/login"
                    onClick={() => setIsAccountOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                      <Plus className="h-4 w-4" />
                    </div>
                    Add another account
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

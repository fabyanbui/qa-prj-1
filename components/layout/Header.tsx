'use client';

import Link from 'next/link';
import { ShoppingCart, User as UserIcon, Plus, ChevronDown, LogOut } from 'lucide-react';
import { useCart } from '@/lib/store/cart-context';
import { useAuth } from '@/lib/store/auth-context';
import { useState, useRef, useEffect } from 'react';

export function Header() {
    const { count } = useCart();
    const { sessions, activeSession, switchAccount, logout } = useAuth();
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsAccountOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="text-2xl font-bold text-indigo-600">
                    ShopPy
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/cart" className="relative p-2 text-gray-500 hover:text-gray-900" aria-label="Cart">
                        <ShoppingCart className="h-6 w-6" />
                        {count > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                                {count}
                            </span>
                        )}
                    </Link>

                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsAccountOpen(!isAccountOpen)}
                            className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 p-1 pr-3 transition-colors hover:bg-gray-100"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                <UserIcon className="h-5 w-5" />
                            </div>
                            <span className="max-w-[100px] truncate text-sm font-medium text-gray-700">
                                {activeSession ? activeSession.user.name : 'Sign In'}
                            </span>
                            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isAccountOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isAccountOpen && (
                            <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white p-2 shadow-2xl ring-1 ring-black/5 focus:outline-none">
                                {sessions.length > 0 && (
                                    <div className="mb-2 px-3 py-2">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Accounts</p>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    {sessions.map((session) => (
                                        <div
                                            key={session.user.email}
                                            className={`group flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${activeSession?.user.email === session.user.email
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'hover:bg-gray-50 text-gray-700'
                                                }`}
                                        >
                                            <button
                                                onClick={() => {
                                                    switchAccount(session.user.email);
                                                    setIsAccountOpen(false);
                                                }}
                                                className="flex flex-1 items-center gap-3 text-left"
                                            >
                                                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${activeSession?.user.email === session.user.email
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                    {session.user.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold">{session.user.name}</span>
                                                    <span className="text-xs text-gray-400">{session.user.email}</span>
                                                    <div className="mt-1 flex gap-1">
                                                        {session.user.roles?.map(role => (
                                                            <span key={role} className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-indigo-700">
                                                                {role}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => logout(session.user.email)}
                                                className="ml-2 hidden p-1 text-gray-400 hover:text-red-500 group-hover:block"
                                            >
                                                <LogOut className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-2 border-t border-gray-100 pt-2">
                                    <Link
                                        href="/login"
                                        onClick={() => setIsAccountOpen(false)}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                                            <Plus className="h-4 w-4" />
                                        </div>
                                        Add Another Account
                                    </Link>

                                    {activeSession?.user.roles.includes('SELLER') && (
                                        <Link
                                            href="/seller"
                                            onClick={() => setIsAccountOpen(false)}
                                            className="mt-1 flex items-center gap-3 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white">
                                                <Plus className="h-4 w-4" />
                                            </div>
                                            My Shop (Dashboard)
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

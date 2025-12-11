'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { LayoutDashboard, ShieldAlert, Users, FileText, Settings, LogOut, Brain, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/agents', label: 'AI Agent Suite', icon: Brain },
    { href: '/cases', label: 'Cases / Alerts', icon: Briefcase },
    { href: '/clients', label: 'Clients', icon: Users },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-white/80 backdrop-blur-xl border-r border-white/40 flex flex-col z-50 shadow-2xl">
            {/* Gradient overlay - business colors */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/5 via-slate-700/5 to-amber-700/5 pointer-events-none" />

            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-white/40 relative z-10 bg-gradient-to-r from-slate-50/50 to-slate-100/50">
                <div className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-amber-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                        <Image
                            src="/xBanker_logo.png"
                            alt="xBanker Logo"
                            width={48}
                            height={48}
                            className="rounded-lg relative z-10 group-hover:scale-110 transition-transform duration-300"
                            unoptimized
                        />
                    </div>
                    <span className="text-slate-900 font-bold text-xl tracking-tight bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                        xBanker
                    </span>
                </div>
            </div>


            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1 flex flex-col relative z-10">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 relative group",
                                isActive
                                    ? "bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-lg shadow-amber-600/20 border border-amber-600/30"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-slate-200/80 hover:to-amber-100/60 hover:shadow-md hover:border hover:border-amber-600/40 hover:scale-[1.02]"
                            )}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-amber-600 rounded-xl blur-md opacity-40 -z-10" />
                            )}
                            <Icon
                                size={18}
                                className={cn(
                                    "transition-transform duration-300 group-hover:scale-110",
                                    isActive ? "text-white" : "text-slate-400 group-hover:text-amber-600"
                                )}
                            />
                            {item.label}
                        </Link>
                    );
                })}

                <div className="mt-auto pt-4">
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-gradient-to-r hover:from-slate-200/80 hover:to-amber-100/60 hover:shadow-md transition-all duration-300 group hover:border hover:border-amber-600/40 hover:scale-[1.02]"
                    >
                        <Settings size={18} className="text-slate-400 group-hover:text-amber-600 group-hover:scale-110 transition-transform duration-300" />
                        Settings
                    </Link>
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/40 relative z-10">
                <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-slate-200/80 hover:to-amber-100/60 transition-all duration-300 group hover:shadow-md hover:border hover:border-amber-600/40 hover:scale-[1.02]"
                >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-semibold text-sm group-hover:ring-4 group-hover:ring-amber-600/20 transition-all duration-300 shadow-lg">
                        JD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">John Doe</p>
                        <p className="text-xs text-slate-500 truncate">Compliance Officer</p>
                    </div>
                </Link>
            </div>
        </aside>
    );
}

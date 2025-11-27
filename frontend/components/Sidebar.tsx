'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { LayoutDashboard, ShieldAlert, Users, FileText, Settings, LogOut, Brain, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/kyc', label: 'KYC Workflows', icon: FileText },
    { href: '/risk', label: 'Risk Surveillance', icon: ShieldAlert },
    { href: '/cases', label: 'Cases / Alerts', icon: Briefcase },
    { href: '/clients', label: 'Clients', icon: Users },
    { href: '/agents', label: 'AI Agents', icon: Brain },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-[#f7f9fc] border-r border-slate-200 flex flex-col z-50">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <Image
                        src="/xBanker_logo.png"
                        alt="xBanker Logo"
                        width={48}
                        height={48}
                        className="rounded-lg"
                        unoptimized
                    />
                    <span className="text-slate-900 font-bold text-xl tracking-tight">xBanker</span>
                </div>
            </div>


            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                isActive
                                    ? "bg-white text-brand shadow-sm ring-1 ring-slate-200"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            )}
                        >
                            <Icon size={18} className={cn(isActive ? "text-brand" : "text-slate-400")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-md w-full hover:bg-slate-100 transition-colors"
                >
                    <Settings size={18} className="text-slate-400" />
                    Settings
                </Link>
                <Link
                    href="/profile"
                    className="mt-4 flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors group"
                >
                    <div className="w-8 h-8 rounded-full bg-brand-subtle flex items-center justify-center text-brand font-medium text-xs group-hover:ring-2 group-hover:ring-brand/20 transition-all">
                        JD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">John Doe</p>
                        <p className="text-xs text-slate-500 truncate">Compliance Officer</p>
                    </div>
                </Link>
            </div>
        </aside>
    );
}

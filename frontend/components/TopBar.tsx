'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, HelpCircle } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

export default function TopBar() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/clients?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-white/40 sticky top-0 z-40 px-8 flex items-center shadow-lg">
            {/* Gradient overlay - business colors */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50/30 via-slate-100/30 to-amber-50/30 pointer-events-none" />

            {/* Search Container - Aligned with page content */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-8">
                <div className="w-full max-w-6xl flex justify-end">
                    <div className="w-full max-w-lg pointer-events-auto">
                        <form onSubmit={handleSearch} className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-700 transition-colors z-10" size={16} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search clients, alerts, or documents..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 focus:bg-white/90 transition-all shadow-md hover:shadow-lg placeholder:text-slate-400"
                            />
                        </form>
                    </div>
                </div>
            </div>

            {/* Actions - Always at the right edge */}
            <div className="ml-auto flex items-center gap-4 z-10 relative">
                <button className="text-slate-400 hover:text-slate-700 transition-all duration-300 hover:scale-110 p-2 rounded-lg hover:bg-white/60">
                    <HelpCircle size={20} />
                </button>
                <NotificationDropdown />
            </div>
        </header>
    );
}

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
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center">
            {/* Search Container - Aligned with page content */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-8">
                <div className="w-full max-w-6xl flex justify-end">
                    <div className="w-full max-w-lg pointer-events-auto">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search clients, alerts, or documents..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                            />
                        </form>
                    </div>
                </div>
            </div>

            {/* Actions - Always at the right edge */}
            <div className="ml-auto flex items-center gap-4 z-10">
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <HelpCircle size={20} />
                </button>
                <NotificationDropdown />
            </div>
        </header>
    );
}

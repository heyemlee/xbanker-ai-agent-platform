'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Search, UserPlus } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/ui/Card';
import Badge, { getRiskBadgeVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { apiClient } from '@/lib/api';
import { ClientListItem } from '@/types';

export default function ClientsPage() {
    const searchParams = useSearchParams();
    const [clients, setClients] = useState<ClientListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

    useEffect(() => {
        loadClients();
    }, []);

    useEffect(() => {
        const urlSearch = searchParams.get('search');
        if (urlSearch) {
            setSearchTerm(urlSearch);
        }
    }, [searchParams]);

    const loadClients = async () => {
        try {
            const data = await apiClient.getClients();
            setClients(data.clients);
        } catch (err) {
            console.error('Failed to load clients:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(client =>
        client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.nationality && client.nationality.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="animate-in fade-in duration-500">
            <PageHeader
                title="Clients"
                description="Manage your client portfolio and monitor risk profiles."
                action={
                    <Link href="/kyc">
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            New Client KYC
                        </Button>
                    </Link>
                }
            />

            <Card noPadding>
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3">Client Name</th>
                                <th className="px-6 py-3">Nationality</th>
                                <th className="px-6 py-3">Risk Score</th>
                                <th className="px-6 py-3">Onboarded</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Loading clients...
                                    </td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No clients found.
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-subtle text-brand flex items-center justify-center text-xs font-bold">
                                                    {client.full_name.charAt(0)}
                                                </div>
                                                {client.full_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {client.nationality || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getRiskBadgeVariant(client.risk_score)}>
                                                {client.risk_score}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(client.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/clients/${client.id}`}
                                                className="inline-flex items-center text-slate-400 hover:text-brand font-medium transition-colors"
                                            >
                                                View <ArrowRight size={16} className="ml-1" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Users, ShieldAlert, FileText, Activity } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/ui/Card';
import Badge, { getRiskBadgeVariant } from '@/components/ui/Badge';
import StatsChart from '@/components/StatsChart';
import { apiClient } from '@/lib/api';
import { DashboardStats, ClientListItem, RiskAlertListItem } from '@/types';
import { cn } from '@/lib/utils';

export default function HomePage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentClients, setRecentClients] = useState<ClientListItem[]>([]);
    const [recentAlerts, setRecentAlerts] = useState<RiskAlertListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [statsData, clientsData, alertsData] = await Promise.all([
                    apiClient.getDashboardStats(),
                    apiClient.getClients(),
                    apiClient.getRiskAlerts()
                ]);
                setStats(statsData);
                setRecentClients(clientsData.clients.slice(0, 5));
                setRecentAlerts(alertsData.alerts.slice(0, 5));
            } catch (error) {
                console.error('Failed to load dashboard data', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const StatItem = ({ title, value, icon: Icon, trend, chart }: any) => (
        <Card className="relative overflow-hidden h-[160px] flex flex-col justify-between" noPadding>
            <div className="relative z-10 p-6 pb-16 flex flex-col h-full">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[15px] font-medium text-slate-500">{title}</p>
                        <h3 className="text-[32px] font-bold text-slate-900 mt-1 tracking-tight">{value}</h3>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#EEF1F5] flex items-center justify-center text-[#0A1A2F]">
                        <Icon size={16} strokeWidth={2.5} />
                    </div>
                </div>

                {trend && (
                    <div className="flex items-center text-sm mt-2">
                        <span className="text-[#059669] font-semibold flex items-center bg-[#059669]/10 px-1.5 py-0.5 rounded text-xs">
                            <ArrowUpRight size={14} className="mr-1" strokeWidth={2.5} />
                            {trend}
                        </span>
                        <span className="text-slate-400 ml-2 text-xs font-medium">vs last month</span>
                    </div>
                )}
            </div>
            {chart && (
                <div className="absolute bottom-0 left-0 right-0 h-[40px] z-0 opacity-60 pointer-events-none">
                    <StatsChart />
                </div>
            )}
        </Card>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Dashboard"
                description="Overview of your compliance and risk landscape."
                action={
                    <div className="flex gap-3">
                        <Link href="/agents" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white bg-brand text-white hover:bg-brand-dark h-9 px-4 py-2 shadow-sm">
                            Run AI Analysis
                        </Link>
                    </div>
                }
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatItem
                    title="Total Clients"
                    value={loading ? '-' : stats?.total_clients}
                    icon={Users}
                    trend="12%"
                    chart
                />
                <StatItem
                    title="High Risk Clients"
                    value={loading ? '-' : stats?.high_risk_clients}
                    icon={ShieldAlert}
                    trend="2%"
                />
                <StatItem
                    title="Open Cases"
                    value={loading ? '-' : stats?.open_cases}
                    icon={Activity}
                    trend="5%"
                />
                <StatItem
                    title="New Alerts (7d)"
                    value={loading ? '-' : stats?.new_alerts_7days}
                    icon={FileText}
                    trend="8%"
                    chart
                />
            </div>

            {/* Compliance Health Section */}
            {!loading && stats && (
                <Card title="Compliance Health">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-sm font-medium text-slate-700">KYC Up-to-date</h4>
                                <span className={cn(
                                    "text-2xl font-bold",
                                    stats.kyc_uptodate_percentage >= 90 ? "text-success-text" :
                                        stats.kyc_uptodate_percentage >= 75 ? "text-warning-text" : "text-danger-text"
                                )}>
                                    {stats.kyc_uptodate_percentage.toFixed(1)}%
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                Percentage of clients with current KYC reviews
                            </p>
                        </div>
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-sm font-medium text-slate-700">Upcoming Reviews (30d)</h4>
                                <span className="text-2xl font-bold text-slate-900">
                                    {stats.kyc_upcoming_reviews}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                Clients requiring KYC review in next 30 days
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity / Alerts */}
                <div className="lg:col-span-2">
                    <Card title="Recent Risk Alerts" noPadding>
                        <div className="divide-y divide-slate-100">
                            {loading ? (
                                <div className="p-6 text-center text-slate-500">Loading alerts...</div>
                            ) : recentAlerts.length === 0 ? (
                                <div className="p-6 text-center text-slate-500">No recent alerts found.</div>
                            ) : (
                                recentAlerts.map((alert) => (
                                    <div key={alert.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
                                        <div className={cn(
                                            "w-2 h-2 mt-2 rounded-full flex-shrink-0",
                                            alert.severity === 'High' ? "bg-danger-text" :
                                                alert.severity === 'Medium' ? "bg-warning-text" : "bg-success-text"
                                        )} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-sm font-medium text-slate-900 truncate">
                                                    {alert.client_name || 'General Alert'}
                                                </p>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(alert.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 line-clamp-2">{alert.summary}</p>
                                            <div className="mt-2 flex gap-2">
                                                {alert.risk_tags?.slice(0, 3).map((tag, i) => (
                                                    <Badge key={i} variant="neutral" className="capitalize">
                                                        {tag.replace(/_/g, ' ')}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Recent Clients */}
                <div>
                    <Card title="Recent Clients" noPadding>
                        <div className="divide-y divide-slate-100">
                            {loading ? (
                                <div className="p-6 text-center text-slate-500">Loading clients...</div>
                            ) : recentClients.length === 0 ? (
                                <div className="p-6 text-center text-slate-500">No recent clients.</div>
                            ) : (
                                recentClients.map((client) => (
                                    <Link
                                        key={client.id}
                                        href={`/clients/${client.id}`}
                                        className="block p-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-sm font-medium text-slate-900">{client.full_name}</p>
                                            <Badge variant={getRiskBadgeVariant(client.risk_score)}>
                                                {client.risk_score}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-slate-500">{client.nationality || 'Unknown Nationality'}</p>
                                    </Link>
                                ))
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                            <Link href="/clients" className="text-sm font-medium text-brand hover:text-brand-dark flex items-center justify-center">
                                View All Clients
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Activity, AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Badge, { getRiskBadgeVariant } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api';
import { RiskAlert, RiskAlertListItem, ClientListItem } from '@/types';
import { cn } from '@/lib/utils';

export default function RiskPage() {
    const [activityLog, setActivityLog] = useState('');
    const [selectedClientId, setSelectedClientId] = useState<number | undefined>();
    const [result, setResult] = useState<RiskAlert | null>(null);
    const [alerts, setAlerts] = useState<RiskAlertListItem[]>([]);
    const [clients, setClients] = useState<ClientListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAlerts();
        loadClients();
    }, []);

    const loadAlerts = async () => {
        try {
            const data = await apiClient.getRiskAlerts();
            setAlerts(data.alerts);
        } catch (err) {
            console.error('Failed to load alerts:', err);
        }
    };

    const loadClients = async () => {
        try {
            const data = await apiClient.getClients();
            setClients(data.clients);
        } catch (err) {
            console.error('Failed to load clients:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await apiClient.analyzeRisk({
                client_id: selectedClientId,
                activity_log: activityLog,
            });

            setResult(data);
            loadAlerts();
            setActivityLog('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to analyze risk');
        } finally {
            setLoading(false);
        }
    };

    const getSeverityVariant = (severity: string): 'default' | 'success' | 'warning' | 'danger' => {
        const s = severity.toLowerCase();
        if (s === 'low') return 'success';
        if (s === 'medium') return 'warning';
        if (s === 'high' || s === 'critical') return 'danger';
        return 'default';
    };

    return (
        <div className="animate-in fade-in duration-500">
            <PageHeader
                title="Risk Surveillance"
                description="Monitor client activities and identify emerging risk signals."
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Analysis Form */}
                <div className="lg:col-span-5 space-y-6">
                    <Card title="New Analysis">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Client (Optional)
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedClientId || ''}
                                        onChange={(e) => setSelectedClientId(e.target.value ? Number(e.target.value) : undefined)}
                                        className="w-full h-10 pl-3 pr-8 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-all shadow-sm hover:border-slate-400 appearance-none"
                                    >
                                        <option value="">General Analysis (No specific client)</option>
                                        {clients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.full_name}
                                            </option>
                                        ))}
                                    </select>
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            <Textarea
                                label="Activity Log / Transaction Notes *"
                                value={activityLog}
                                onChange={(e) => setActivityLog(e.target.value)}
                                required
                                rows={8}
                                placeholder="Paste activity logs, news snippets, or transaction details..."
                            />

                            {error && (
                                <div className="p-3 bg-danger-bg border border-danger-text/20 rounded-md text-danger-text text-sm">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" isLoading={loading} className="w-full">
                                Analyze Risk
                            </Button>
                        </form>
                    </Card>

                    {/* Analysis Result (Conditional) */}
                    {result && (
                        <div className="animate-in slide-in-from-top-4 duration-300">
                            <Card className="border-l-4 border-l-brand">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Analysis Result</h3>
                                        <p className="text-xs text-slate-500 mt-1">Just now</p>
                                    </div>
                                    <Badge variant={getSeverityVariant(result.severity)} className="text-sm px-3 py-1">
                                        {result.severity} Severity
                                    </Badge>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Summary</h4>
                                        <p className="text-sm text-slate-700">{result.summary}</p>
                                    </div>

                                    {result.risk_tags && result.risk_tags.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Detected Risks</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {result.risk_tags.map((tag, index) => (
                                                    <Badge key={index} variant="neutral">
                                                        {tag.replace(/_/g, ' ')}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {result.next_steps && (
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Recommended Actions</h4>
                                            <p className="text-sm text-slate-700 whitespace-pre-line">{result.next_steps}</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Right Column: Alert Feed */}
                <div className="lg:col-span-7">
                    <Card title="Risk Alert Feed" noPadding>
                        <div className="divide-y divide-slate-100">
                            {alerts.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">
                                    <ShieldAlert className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                                    <p className="font-medium">No risk alerts detected</p>
                                    <p className="text-sm mt-1">Run an analysis to generate alerts.</p>
                                </div>
                            ) : (
                                alerts.map((alert) => (
                                    <div key={alert.id} className="p-6 hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                                    alert.severity === 'High' || alert.severity === 'Critical' ? "bg-danger-bg text-danger-text" :
                                                        alert.severity === 'Medium' ? "bg-warning-bg text-warning-text" : "bg-success-bg text-success-text"
                                                )}>
                                                    <AlertTriangle size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900">
                                                        {alert.client_name || 'General Alert'}
                                                    </h4>
                                                    <p className="text-xs text-slate-500">
                                                        {new Date(alert.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant={getSeverityVariant(alert.severity)}>
                                                {alert.severity}
                                            </Badge>
                                        </div>

                                        <p className="text-sm text-slate-600 mb-4 pl-13 ml-13">
                                            {alert.summary}
                                        </p>

                                        {alert.risk_tags && alert.risk_tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 ml-13">
                                                {alert.risk_tags.map((tag, i) => (
                                                    <span key={i} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

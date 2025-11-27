'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Search } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import AIAnalysisPanel from '@/components/AIAnalysisPanel';
import { apiClient } from '@/lib/api';
import { RiskAlertListItem, ClientListItem } from '@/types';
import { cn } from '@/lib/utils';

export default function RiskPage() {
    const [selectedClientId, setSelectedClientId] = useState<number | undefined>();
    const [result, setResult] = useState<any | null>(null);
    const [alerts, setAlerts] = useState<RiskAlertListItem[]>([]);
    const [clients, setClients] = useState<ClientListItem[]>([]);
    const [loading, setLoading] = useState(false);

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

    const handleAnalyze = async (context: string) => {
        setLoading(true);
        setResult(null);

        try {
            const data = await apiClient.analyzeRisk({
                client_id: selectedClientId,
                activity_log: context,
            });

            setResult(data);
            loadAlerts();
        } catch (err) {
            console.error('Analysis failed:', err);
            alert('Failed to analyze risk data. Please try again.');
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
        <div className="animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
            <div className="mb-6">
                <PageHeader
                    title="Risk Surveillance"
                    description="Monitor client activities and identify emerging risk signals."
                />
            </div>

            <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-8">
                {/* Main Analysis Area */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="mb-4 max-w-md">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Associated Client (Optional)
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

                    <div className="flex-1 min-h-0">
                        <AIAnalysisPanel
                            templateType="RISK_SURVEILLANCE"
                            onAnalyze={handleAnalyze}
                            loading={loading}
                            result={result}
                            title="Risk Pattern Analysis"
                            description="Detect money laundering, fraud, and suspicious behavior patterns."
                            placeholder="Paste transaction logs, swift messages, or negative news articles..."
                        />
                    </div>
                </div>

                {/* Right Column: Recent Alerts Feed */}
                <div className="w-full lg:w-96 flex-shrink-0 flex flex-col min-h-0">
                    <Card title="Recent Alerts" className="flex-1 flex flex-col min-h-0" noPadding>
                        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                            {alerts.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    <ShieldAlert className="mx-auto h-8 w-8 text-slate-200 mb-3" />
                                    <p className="text-sm">No risk alerts detected</p>
                                </div>
                            ) : (
                                alerts.map((alert) => (
                                    <div key={alert.id} className="p-4 hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    alert.severity === 'High' || alert.severity === 'Critical' ? "bg-danger-text" :
                                                        alert.severity === 'Medium' ? "bg-warning-text" : "bg-success-text"
                                                )} />
                                                <h4 className="text-sm font-semibold text-slate-900 truncate max-w-[150px]">
                                                    {alert.client_name || 'General Alert'}
                                                </h4>
                                            </div>
                                            <span className="text-xs text-slate-400">
                                                {new Date(alert.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                                            {alert.summary}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <Badge variant={getSeverityVariant(alert.severity)} className="text-[10px] px-1.5 py-0.5">
                                                {alert.severity}
                                            </Badge>
                                            {alert.risk_tags && alert.risk_tags.length > 0 && (
                                                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                    +{alert.risk_tags.length} tags
                                                </span>
                                            )}
                                        </div>
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


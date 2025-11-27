'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, FileText, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import DatePicker from '@/components/ui/DatePicker';
import CountrySelect from '@/components/ui/CountrySelect';
import Badge, { getRiskBadgeVariant } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api';
import { Client, ClientListItem, KYCAnalysisRequest } from '@/types';
import { cn } from '@/lib/utils';

export default function KYCPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<KYCAnalysisRequest>({
        full_name: '',
        date_of_birth: '',
        nationality: '',
        residency_country: '',
        source_of_wealth: '',
        business_activity: '',
        kyc_notes: '',
    });
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const [result, setResult] = useState<Client | null>(null);
    const [clients, setClients] = useState<ClientListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadClients();
    }, []);

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
            const analysisData: KYCAnalysisRequest = {
                ...formData,
                date_of_birth: formData.date_of_birth || undefined,
            };

            const data = await apiClient.analyzeKYC(analysisData);
            setResult(data);
            loadClients();

            // Optional: Clear form or keep it for reference? Keeping it is usually better UX for "try again" scenarios, 
            // but for a "new" workflow, maybe clear. Let's keep it for now.
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to analyze KYC data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="animate-in fade-in duration-500">
            <PageHeader
                title="KYC Workflows"
                description="Automated identity verification and risk assessment."
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Input Form */}
                <div className="lg:col-span-7 space-y-6">
                    <Card title="Client Information">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="Full Name *"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                placeholder="e.g. John Doe"
                            />

                            <div className="grid grid-cols-2 gap-5">
                                <DatePicker
                                    label="Date of Birth"
                                    selected={selectedDate}
                                    onChange={(date) => {
                                        setSelectedDate(date);
                                        setFormData({ ...formData, date_of_birth: date ? date.toISOString().split('T')[0] : '' });
                                    }}
                                    placeholder="Select date of birth"
                                />
                                <CountrySelect
                                    label="Nationality"
                                    value={formData.nationality}
                                    onChange={(value) => setFormData({ ...formData, nationality: value })}
                                    placeholder="Select nationality"
                                />
                            </div>

                            <CountrySelect
                                label="Residency Country"
                                value={formData.residency_country}
                                onChange={(value) => setFormData({ ...formData, residency_country: value })}
                                placeholder="Select residency country"
                            />

                            <div className="grid grid-cols-2 gap-5">
                                <Input
                                    label="Source of Wealth"
                                    name="source_of_wealth"
                                    value={formData.source_of_wealth}
                                    onChange={handleChange}
                                    placeholder="e.g. Business profits"
                                />
                                <Input
                                    label="Business Activity"
                                    name="business_activity"
                                    value={formData.business_activity}
                                    onChange={handleChange}
                                    placeholder="e.g. Real Estate"
                                />
                            </div>

                            <Textarea
                                label="KYC Notes / Document Text *"
                                name="kyc_notes"
                                value={formData.kyc_notes}
                                onChange={handleChange}
                                required
                                rows={6}
                                placeholder="Paste full KYC documentation, notes, or relevant client information here for AI analysis..."
                            />

                            {error && (
                                <div className="p-3 bg-danger-bg border border-danger-text/20 rounded-md text-danger-text text-sm flex items-center gap-2">
                                    <XCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <div className="pt-2">
                                <Button type="submit" isLoading={loading} className="w-full">
                                    Run AI Analysis
                                </Button>
                            </div>
                        </form>
                    </Card>

                    <Card title="Recent Analyses" noPadding>
                        <div className="divide-y divide-slate-100">
                            {clients.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    <FileText className="mx-auto h-8 w-8 text-slate-300 mb-3" />
                                    <p>No analyses yet.</p>
                                </div>
                            ) : (
                                clients.slice(0, 5).map((client) => (
                                    <div
                                        key={client.id}
                                        className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/clients/${client.id}`)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                                                {client.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{client.full_name}</p>
                                                <p className="text-xs text-slate-500">{new Date(client.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant={getRiskBadgeVariant(client.risk_score)}>
                                                {client.risk_score}
                                            </Badge>
                                            <ArrowRight size={16} className="text-slate-300" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Results (Sticky) */}
                <div className="lg:col-span-5">
                    <div className="sticky top-24 space-y-6">
                        {!result ? (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                                    <FileText className="text-brand" size={24} />
                                </div>
                                <h3 className="text-slate-900 font-medium mb-1">Ready to Analyze</h3>
                                <p className="text-slate-500 text-sm">
                                    Fill out the form and run analysis to see AI-generated risk assessment and insights here.
                                </p>
                            </div>
                        ) : (
                            <Card className="border-brand/20 shadow-float ring-1 ring-brand/10">
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-bold text-slate-900">Analysis Result</h3>
                                        <Badge variant={getRiskBadgeVariant(result.risk_score)} className="text-sm px-3 py-1">
                                            {result.risk_score} Risk
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        Generated on {new Date().toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {/* Flags */}
                                    <div className="flex gap-3">
                                        <div className={cn(
                                            "flex-1 p-3 rounded-lg border flex items-center gap-2",
                                            result.pep_flag ? "bg-warning-bg border-warning-text/20 text-warning-text" : "bg-slate-50 border-slate-100 text-slate-500"
                                        )}>
                                            {result.pep_flag ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                                            <span className="text-sm font-medium">PEP Check</span>
                                        </div>
                                        <div className={cn(
                                            "flex-1 p-3 rounded-lg border flex items-center gap-2",
                                            result.sanctions_flag ? "bg-danger-bg border-danger-text/20 text-danger-text" : "bg-slate-50 border-slate-100 text-slate-500"
                                        )}>
                                            {result.sanctions_flag ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                                            <span className="text-sm font-medium">Sanctions</span>
                                        </div>
                                    </div>

                                    {/* Rationale */}
                                    <div>
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Risk Rationale</h4>
                                        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            {result.risk_rationale}
                                        </p>
                                    </div>

                                    {/* Summary */}
                                    <div>
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">KYC Summary</h4>
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            {result.kyc_summary}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100">
                                        <Button
                                            variant="secondary"
                                            className="w-full"
                                            onClick={() => router.push(`/clients/${result.id}`)}
                                        >
                                            View Full Profile
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Input from '@/components/ui/Input';
import AIAnalysisPanel from '@/components/AIAnalysisPanel';
import { apiClient } from '@/lib/api';
import { Client, KYCAnalysisRequest } from '@/types';

export default function KYCPage() {
    const router = useRouter();
    const [clientName, setClientName] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any | null>(null);

    const handleAnalyze = async (context: string) => {
        if (!clientName.trim()) {
            alert('Please enter a client name');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const analysisData: KYCAnalysisRequest = {
                full_name: clientName,
                kyc_notes: context,
                // Optional fields left empty for AI to extract/infer from notes if needed
                // In a full version, we might want to extract these or offer inputs
            };

            const data = await apiClient.analyzeKYC(analysisData);
            setResult(data);
        } catch (err) {
            console.error('Analysis failed:', err);
            alert('Failed to analyze KYC data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
            <div className="mb-6">
                <PageHeader
                    title="KYC Workflows"
                    description="Automated identity verification and risk assessment using AI."
                />
            </div>

            <div className="mb-6 max-w-md">
                <Input
                    label="Client Name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Enter client full name..."
                    required
                />
            </div>

            <div className="flex-1 min-h-0">
                <AIAnalysisPanel
                    templateType="KYC_ANALYSIS"
                    onAnalyze={handleAnalyze}
                    loading={loading}
                    result={result}
                    title="KYC Document Analysis"
                    description="Paste client documents, emails, or notes here. The AI will extract risk factors, screen for PEP/Sanctions, and determine CDD requirements."
                    placeholder="Paste KYC documents, passport details, source of wealth declarations, or meeting notes..."
                />
            </div>
        </div>
    );
}


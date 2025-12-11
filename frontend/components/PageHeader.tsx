import { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
    return (
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/60 mb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
                    {description && (
                        <p className="mt-1 text-sm text-slate-600">{description}</p>
                    )}
                </div>
                {action && <div>{action}</div>}
            </div>
        </div>
    );
}

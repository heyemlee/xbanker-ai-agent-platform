import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BadgeProps {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'neutral' | 'brand';
    children: ReactNode;
    className?: string;
}

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset",
                {
                    'bg-slate-50 text-slate-600 ring-slate-500/10': variant === 'default' || variant === 'neutral',
                    'bg-success-bg text-success-text ring-success-text/20': variant === 'success',
                    'bg-warning-bg text-warning-text ring-warning-text/20': variant === 'warning',
                    'bg-danger-bg text-danger-text ring-danger-text/20': variant === 'danger',
                    'bg-brand-subtle text-brand-dark ring-brand/20': variant === 'brand',
                },
                className
            )}
        >
            {children}
        </span>
    );
}

export function getRiskBadgeVariant(riskScore?: string): BadgeProps['variant'] {
    if (!riskScore) return 'neutral';
    const score = riskScore.toLowerCase();
    if (score === 'low') return 'success';
    if (score === 'medium') return 'warning';
    if (score === 'high' || score === 'critical') return 'danger';
    return 'neutral';
}

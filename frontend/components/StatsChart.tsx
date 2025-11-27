'use client';

import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const data = [
    { name: 'Mon', value: 400 },
    { name: 'Tue', value: 300 },
    { name: 'Wed', value: 550 },
    { name: 'Thu', value: 450 },
    { name: 'Fri', value: 650 },
    { name: 'Sat', value: 500 },
    { name: 'Sun', value: 700 },
];

export default function StatsChart() {
    return (
        <div className="h-[60px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#6C7AFB"
                        strokeWidth={2}
                        dot={false}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        cursor={{ stroke: '#e3e8ee' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

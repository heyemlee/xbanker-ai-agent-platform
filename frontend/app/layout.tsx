import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import ParticleBackground from '@/components/ParticleBackground';
import PageTransition from '@/components/PageTransition';

export const metadata: Metadata = {
    title: 'xBanker AI Agent Suite',
    description: 'Intelligent Automation for Private Banks & External Asset Managers',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="flex min-h-screen">
                <ParticleBackground />
                <Sidebar />
                <div className="flex-1 flex flex-col ml-64">
                    <TopBar />
                    <main className="flex-1 p-8 overflow-y-auto">
                        <div className="max-w-6xl mx-auto">
                            <PageTransition>
                                {children}
                            </PageTransition>
                        </div>
                    </main>
                </div>
            </body>
        </html>
    );
}

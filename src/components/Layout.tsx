import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, PlusCircle, Github, Award, Settings } from 'lucide-react';
import { isAuthenticated, getStoredUser } from '../lib/github';

// X (Twitter) icon component
const XIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const authenticated = isAuthenticated();
    const user = getStoredUser();

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-6">
                            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                                <ShieldCheck className="h-8 w-8 text-blue-600" />
                                <span className="font-bold text-xl tracking-tight">OpenBadge</span>
                            </Link>
                            <div className="hidden md:flex items-center gap-4">
                                <Link
                                    to="/badges"
                                    className="text-slate-600 hover:text-blue-600 flex items-center gap-1.5 font-medium transition-colors"
                                >
                                    <Award className="h-4 w-4" />
                                    <span>Badges</span>
                                </Link>
                                <Link
                                    to="/create"
                                    className="text-slate-600 hover:text-blue-600 flex items-center gap-1.5 font-medium transition-colors"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Issue</span>
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                to="/settings"
                                className="text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                title="Settings"
                            >
                                <Settings className="h-5 w-5" />
                            </Link>
                            {authenticated && user ? (
                                <Link to="/settings" className="flex items-center gap-2">
                                    <img
                                        src={user.avatar_url}
                                        alt={user.login}
                                        className="w-8 h-8 rounded-full border-2 border-green-400"
                                        title={`Connected as ${user.login}`}
                                    />
                                </Link>
                            ) : (
                                <a
                                    href="https://github.com/saiyam1814/myopenbadge"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <Github className="h-5 w-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation */}
            <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2">
                <div className="flex justify-center gap-6">
                    <Link
                        to="/badges"
                        className="text-slate-600 hover:text-blue-600 flex items-center gap-1.5 text-sm font-medium transition-colors"
                    >
                        <Award className="h-4 w-4" />
                        <span>Badges</span>
                    </Link>
                    <Link
                        to="/create"
                        className="text-slate-600 hover:text-blue-600 flex items-center gap-1.5 text-sm font-medium transition-colors"
                    >
                        <PlusCircle className="h-4 w-4" />
                        <span>Issue Badge</span>
                    </Link>
                </div>
            </div>

            <main className="flex-grow">
                {children}
            </main>

            <footer className="bg-white border-t border-slate-200 mt-12">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Powered by Kubesimplify */}
                        <a
                            href="https://kubesimplify.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
                        >
                            <span className="text-sm">Powered by</span>
                            <img 
                                src="https://raw.githubusercontent.com/kubesimplify/artwork/main/logos/logo-dark.svg"
                                alt="Kubesimplify"
                                className="h-6 group-hover:scale-105 transition-transform"
                            />
                        </a>

                        {/* Center - Copyright */}
                        <p className="text-slate-500 text-sm">
                            &copy; {new Date().getFullYear()} OpenBadge • Open Badges v2.0 Compliant
                        </p>

                        {/* Created by Saiyam Pathak */}
                        <a
                            href="https://x.com/SaiyamPathak"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
                        >
                            <span className="text-sm">Created by</span>
                            <span className="font-semibold text-sm group-hover:text-blue-600 transition-colors">Saiyam Pathak</span>
                            <XIcon className="h-4 w-4 group-hover:text-blue-600 transition-colors" />
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;

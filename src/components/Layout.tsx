import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, PlusCircle, Github, Award, Settings } from 'lucide-react';
import { isAuthenticated, getStoredUser } from '../lib/github';

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
                    <p className="text-center text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} OpenBadge. Hosted on GitHub. Open Badges v2.0 Compliant.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;

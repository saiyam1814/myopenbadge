import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, PlusCircle, Github } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                                <ShieldCheck className="h-8 w-8 text-blue-600" />
                                <span className="font-bold text-xl tracking-tight">OpenBadge</span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                to="/create"
                                className="text-slate-600 hover:text-blue-600 flex items-center gap-1 font-medium transition-colors"
                            >
                                <PlusCircle className="h-5 w-5" />
                                <span className="hidden sm:inline">Issue Badge</span>
                            </Link>
                            <a
                                href="https://github.com/saiyampathak/myopenbadge"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-600 hover:text-slate-900"
                            >
                                <Github className="h-6 w-6" />
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow">
                {children}
            </main>

            <footer className="bg-white border-t border-slate-200 mt-12">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} OpenBadge. Hosted on GitHub.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;

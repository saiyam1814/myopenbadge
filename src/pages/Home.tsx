import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, Award, Github } from 'lucide-react';

const Home: React.FC = () => {
    const [badgeId, setBadgeId] = useState('');
    const navigate = useNavigate();

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        if (badgeId.trim()) {
            navigate(`/verify/${badgeId.trim()}`);
        }
    };

    return (
        <div className="flex flex-col items-center">
            {/* Hero Section */}
            <div className="w-full bg-gradient-to-b from-blue-50 to-white py-20 px-4 text-center border-b border-indigo-50">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
                        <ShieldCheck className="h-12 w-12 text-blue-600" />
                    </div>
                    <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
                        Verify & Issue <br />
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Open Badges
                        </span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        A fully open-source badge issuer and verifier hosted entirely on GitHub.
                        Store badges as JSON, verify them instantly, and share on LinkedIn.
                    </p>

                    <form onSubmit={handleVerify} className="max-w-md mx-auto mt-8 relative">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="Enter Badge ID (e.g., sample)"
                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg"
                                value={badgeId}
                                onChange={(e) => setBadgeId(e.target.value)}
                            />
                            <Search className="absolute left-4 h-6 w-6 text-slate-400" />
                            <button
                                type="submit"
                                className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Verify
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 mt-3">
                            Try verifying <span className="font-mono bg-slate-100 px-1 py-0.5 rounded cursor-pointer hover:text-blue-600" onClick={() => setBadgeId('sample')}>sample</span>
                        </p>
                    </form>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-3 gap-12">
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                        <Award className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Standard Compliant</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Fully compatible with Open Badges v3.0 standard. Badges are portable and verifiable anywhere.
                    </p>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                        <Github className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Hosted on GitHub</h3>
                    <p className="text-slate-600 leading-relaxed">
                        No backend required. Badges live as JSON files in your repository. Fork, customize, and deploy.
                    </p>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                        <ShieldCheck className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Instant Verification</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Recipient identity and badge integrity are cryptographically verified in the browser.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;

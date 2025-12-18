import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Search, Award, Github, Zap, GitPullRequest, Tag, Globe } from 'lucide-react';

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
            <div className="w-full bg-gradient-to-b from-blue-50 via-indigo-50/50 to-white py-20 px-4 text-center border-b border-indigo-50">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4 shadow-lg shadow-blue-100">
                        <ShieldCheck className="h-12 w-12 text-blue-600" />
                    </div>
                    <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
                        Verify & Issue <br />
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Open Badges
                        </span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        A fully open-source badge issuer and verifier. Create badges, automate issuance via GitHub PRs, 
                        and let recipients share on LinkedIn.
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

                    <div className="flex justify-center gap-4 pt-4">
                        <Link
                            to="/badges"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-medium transition-all shadow-sm hover:shadow"
                        >
                            <Award className="h-5 w-5" />
                            Browse Badges
                        </Link>
                        <Link
                            to="/create"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors shadow-lg"
                        >
                            <Zap className="h-5 w-5" />
                            Issue Badge
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                        <Award className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Standard Compliant</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Fully compatible with Open Badges v2.0 standard. Badges are portable and verifiable anywhere.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                        <GitPullRequest className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Automated PRs</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Connect GitHub to automatically create PRs for badge issuance and revocation. Just like Credly!
                    </p>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                        <Tag className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Skills & Tags</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Add skills and tags to badges. Showcase competencies that matter and make badges searchable.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                        <Globe className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Custom Domain</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Deploy on Vercel, GitHub Pages, or any host. Use your own domain for branded verification links.
                    </p>
                </div>
            </div>

            {/* How It Works */}
            <div className="w-full bg-slate-900 py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">1</div>
                            <h3 className="text-white font-semibold mb-2">Connect GitHub</h3>
                            <p className="text-slate-400 text-sm">Authorize the app to create PRs on your repository.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">2</div>
                            <h3 className="text-white font-semibold mb-2">Issue Badge</h3>
                            <p className="text-slate-400 text-sm">Fill the form with recipient details, skills, and badge info.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">3</div>
                            <h3 className="text-white font-semibold mb-2">Merge & Share</h3>
                            <p className="text-slate-400 text-sm">Merge the PR and the badge is live! Recipients can add to LinkedIn.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Issue Badges?</h2>
                <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                    Start recognizing achievements with verifiable digital credentials. 
                    It's free, open-source, and takes just minutes to set up.
                </p>
                <div className="flex justify-center gap-4">
                    <Link
                        to="/settings"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors"
                    >
                        <Github className="h-5 w-5" />
                        Get Started
                    </Link>
                    <a
                        href="https://github.com/saiyam1814/myopenbadge"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-medium transition-all"
                    >
                        View on GitHub
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Home;

import React, { useEffect, useState } from 'react';
import { Github, LogOut, CheckCircle, AlertCircle, Loader2, ExternalLink, FolderGit2, Key, Info, Copy, Eye, EyeOff } from 'lucide-react';
import {
    logout,
    isAuthenticated,
    getStoredUser,
    getStoredRepoConfig,
    setRepoConfig,
    fetchUserRepos,
    getAppConfig,
    setPersonalAccessToken,
    getPersonalAccessToken,
    clearPersonalAccessToken,
    hasPersonalAccessToken,
    validatePersonalAccessToken
} from '../lib/github';
import type { GitHubUser } from '../types';

const Settings: React.FC = () => {
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState<GitHubUser | null>(null);
    const [repos, setRepos] = useState<{ name: string; full_name: string; owner: { login: string } }[]>([]);
    const [selectedRepo, setSelectedRepo] = useState<string>('');
    const [reposLoading, setReposLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    
    // PAT state
    const [patInput, setPatInput] = useState('');
    const [patError, setPatError] = useState('');
    const [showPat, setShowPat] = useState(false);
    const [validatingPat, setValidatingPat] = useState(false);
    
    const currentConfig = getStoredRepoConfig();
    const appConfig = getAppConfig();

    // Check for existing auth on mount
    useEffect(() => {
        const checkAuth = async () => {
            const storedUser = getStoredUser();
            const hasToken = hasPersonalAccessToken() || isAuthenticated();
            
            if (storedUser && hasToken) {
                // User and token both exist
                setUser(storedUser);
                setAuthenticated(true);
            } else if (hasToken && !storedUser) {
                // Token exists but user data missing - re-validate
                const pat = getPersonalAccessToken();
                if (pat) {
                    const userData = await validatePersonalAccessToken(pat);
                    if (userData) {
                        setUser(userData);
                        localStorage.setItem('github_user', JSON.stringify(userData));
                        setAuthenticated(true);
                    }
                }
            }
            
            setInitializing(false);
        };
        
        checkAuth();
    }, []);

    useEffect(() => {
        if (authenticated) {
            loadReposAndUser();
            if (currentConfig) {
                setSelectedRepo(`${currentConfig.owner}/${currentConfig.repo}`);
            }
        }
    }, [authenticated]);

    const loadReposAndUser = async () => {
        setReposLoading(true);
        
        // If using PAT, validate and get user
        const pat = getPersonalAccessToken();
        if (pat && !user) {
            const userData = await validatePersonalAccessToken(pat);
            if (userData) {
                setUser(userData);
                localStorage.setItem('github_user', JSON.stringify(userData));
            }
        }
        
        const fetchedRepos = await fetchUserRepos();
        setRepos(fetchedRepos);
        setReposLoading(false);
    };

    const handlePatSubmit = async () => {
        if (!patInput.trim()) {
            setPatError('Please enter a token');
            return;
        }

        setValidatingPat(true);
        setPatError('');

        const userData = await validatePersonalAccessToken(patInput.trim());
        
        if (userData) {
            setPersonalAccessToken(patInput.trim());
            setUser(userData);
            localStorage.setItem('github_user', JSON.stringify(userData));
            setAuthenticated(true);
            setPatInput('');
            loadReposAndUser();
        } else {
            setPatError('Invalid token. Make sure it has "repo" scope.');
        }
        
        setValidatingPat(false);
    };

    const handleLogout = () => {
        logout();
        clearPersonalAccessToken();
        setAuthenticated(false);
        setUser(null);
        setRepos([]);
        setSelectedRepo('');
    };

    const handleRepoSelect = (fullName: string) => {
        const [owner, repo] = fullName.split('/');
        setRepoConfig(owner, repo);
        setSelectedRepo(fullName);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-600 mt-2">Configure GitHub integration for automated badge management.</p>
            </div>

            {/* GitHub Connection */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                        <Github className="h-5 w-5" />
                        GitHub Connection
                    </h2>
                </div>
                
                <div className="p-6">
                    {initializing ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            <span className="ml-2 text-slate-600">Checking connection...</span>
                        </div>
                    ) : authenticated && user ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                                <img
                                    src={user.avatar_url}
                                    alt={user.login}
                                    className="w-12 h-12 rounded-full border-2 border-green-300"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-green-900">{user.name || user.login}</span>
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                    <span className="text-sm text-green-700">@{user.login}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Disconnect
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Personal Access Token Method */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                                <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-3">
                                    <Key className="h-5 w-5" />
                                    Connect with Personal Access Token
                                </h3>
                                <p className="text-sm text-blue-800 mb-4">
                                    Works on any hosting (GitHub Pages, Vercel, local). Your token is stored locally in your browser only.
                                </p>
                                
                                <div className="space-y-3">
                                    <div className="relative">
                                        <input
                                            type={showPat ? 'text' : 'password'}
                                            value={patInput}
                                            onChange={(e) => setPatInput(e.target.value)}
                                            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                            className="w-full px-4 py-3 pr-20 rounded-lg border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-mono text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPat(!showPat)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
                                        >
                                            {showPat ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    
                                    {patError && (
                                        <p className="text-red-600 text-sm flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {patError}
                                        </p>
                                    )}
                                    
                                    <button
                                        onClick={handlePatSubmit}
                                        disabled={validatingPat}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {validatingPat ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Validating...
                                            </>
                                        ) : (
                                            <>
                                                <Key className="h-5 w-5" />
                                                Connect with Token
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* How to get PAT */}
                            <div className="bg-slate-50 rounded-xl p-5">
                                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <Info className="h-5 w-5" />
                                    How to Create a Personal Access Token
                                </h4>
                                <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                                    <li>
                                        Go to{' '}
                                        <a 
                                            href="https://github.com/settings/tokens/new?scopes=repo&description=OpenBadge%20App" 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="text-blue-600 hover:underline font-medium"
                                        >
                                            GitHub → Settings → Developer Settings → Personal Access Tokens → Generate New Token
                                        </a>
                                    </li>
                                    <li>Give it a name like "OpenBadge App"</li>
                                    <li>
                                        Select the <code className="bg-slate-200 px-1 rounded">repo</code> scope (full control of private repositories)
                                    </li>
                                    <li>Click "Generate token" and copy it</li>
                                    <li>Paste it above - your token is stored locally in your browser only</li>
                                </ol>
                                
                                <a
                                    href="https://github.com/settings/tokens/new?scopes=repo&description=OpenBadge%20App"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Github className="h-4 w-4" />
                                    Create Token on GitHub
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Repository Selection */}
            {authenticated && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                            <FolderGit2 className="h-5 w-5" />
                            Repository Configuration
                        </h2>
                    </div>
                    
                    <div className="p-6">
                        <p className="text-slate-600 mb-4">
                            Select the repository where badges will be stored. PRs will be created against this repository.
                        </p>
                        
                        {reposLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                <span className="ml-2 text-slate-600">Loading repositories...</span>
                            </div>
                        ) : repos.length === 0 ? (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800">
                                <AlertCircle className="h-5 w-5 inline mr-2" />
                                No repositories found. Make sure your token has the "repo" scope.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <select
                                    value={selectedRepo}
                                    onChange={(e) => handleRepoSelect(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                >
                                    <option value="">Select a repository...</option>
                                    {repos.map((repo) => (
                                        <option key={repo.full_name} value={repo.full_name}>
                                            {repo.full_name}
                                        </option>
                                    ))}
                                </select>
                                
                                {selectedRepo && (
                                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span>Badges will be stored in <code className="font-mono bg-green-100 px-1 rounded">{selectedRepo}/public/badges/</code></span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Environment Info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-semibold text-slate-900">Application Info</h2>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="grid gap-4">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600">Base URL</span>
                            <div className="flex items-center gap-2">
                                <code className="font-mono text-sm bg-slate-200 px-2 py-1 rounded">{appConfig.baseUrl}</code>
                                <button 
                                    onClick={() => copyToClipboard(appConfig.baseUrl)}
                                    className="p-1 hover:bg-slate-200 rounded"
                                >
                                    <Copy className="h-4 w-4 text-slate-500" />
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600">Badges Path</span>
                            <code className="font-mono text-sm bg-slate-200 px-2 py-1 rounded">{appConfig.badgesPath}</code>
                        </div>
                        {selectedRepo && (
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-slate-600">Verification URL Example</span>
                                <code className="font-mono text-xs bg-slate-200 px-2 py-1 rounded">{appConfig.baseUrl}/verify/badge-name-firstname</code>
                            </div>
                        )}
                    </div>
                    
                    {/* Security Note */}
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Security Note
                        </h4>
                        <p className="text-sm text-amber-700">
                            Your Personal Access Token is stored only in your browser's local storage. 
                            It is never sent to any server except GitHub's API directly. 
                            You can revoke it anytime at{' '}
                            <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="underline">
                                github.com/settings/tokens
                            </a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;

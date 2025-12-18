import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, User, Calendar, Trash2, ExternalLink, AlertCircle, Loader2, Tag, Globe, FolderGit2 } from 'lucide-react';
import type { BadgeAssertion } from '../types';
import { fetchBadgesFromRepo, deleteBadgePR, isAuthenticated, getStoredRepoConfig } from '../lib/github';

interface BadgeWithMeta extends BadgeAssertion {
    _filename: string;
}

type ViewMode = 'public' | 'my-repo';

const BadgeGallery: React.FC = () => {
    const [badges, setBadges] = useState<BadgeWithMeta[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);
    const [prMessage, setPrMessage] = useState<{ type: 'success' | 'error'; text: string; url?: string } | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('public');
    
    const repoConfig = getStoredRepoConfig();
    const authenticated = isAuthenticated();

    useEffect(() => {
        loadBadges();
    }, [viewMode]);

    const loadBadges = async () => {
        setLoading(true);
        setError(null);
        
        if (viewMode === 'public') {
            // Load badges from the current hosted site (public/badges/)
            await loadPublicBadges();
        } else {
            // Load badges from user's configured repo
            const { badges: fetchedBadges, error: fetchError } = await fetchBadgesFromRepo();
            
            if (fetchError) {
                setError(fetchError);
            } else {
                setBadges(fetchedBadges as BadgeWithMeta[]);
            }
        }
        
        setLoading(false);
    };

    const loadPublicBadges = async () => {
        try {
            const basePath = import.meta.env.BASE_URL || '/';
            
            // First try to load from badge-list.json (works on GitHub Pages)
            try {
                const listResponse = await fetch(`${basePath}badges/badge-list.json`);
                if (listResponse.ok) {
                    const badgeList = await listResponse.json();
                    const fetchedBadges = await Promise.all(
                        badgeList.map(async (filename: string) => {
                            try {
                                const badgeResponse = await fetch(`${basePath}badges/${filename}`);
                                if (badgeResponse.ok) {
                                    const badge = await badgeResponse.json();
                                    return { ...badge, _filename: filename };
                                }
                            } catch {
                                return null;
                            }
                            return null;
                        })
                    );
                    setBadges(fetchedBadges.filter(Boolean) as BadgeWithMeta[]);
                    return;
                }
            } catch {
                // badge-list.json doesn't exist, try directory listing
            }

            // Fallback: Try directory listing (works in local dev)
            const response = await fetch(`${basePath}badges/`);
            if (response.ok) {
                const html = await response.text();
                
                // Check if it's a Vite directory listing
                if (html.includes('<!DOCTYPE html>') || html.includes('<html')) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const links = Array.from(doc.querySelectorAll('a'));
                    const jsonFiles = links
                        .map(a => a.getAttribute('href'))
                        .filter(href => href && href.endsWith('.json') && !href.includes('badge-list.json')) as string[];

                    if (jsonFiles.length > 0) {
                        const fetchedBadges = await Promise.all(
                            jsonFiles.map(async (filename) => {
                                try {
                                    const badgeResponse = await fetch(`${basePath}badges/${filename}`);
                                    if (badgeResponse.ok) {
                                        const badge = await badgeResponse.json();
                                        return { ...badge, _filename: filename };
                                    }
                                } catch {
                                    return null;
                                }
                                return null;
                            })
                        );
                        
                        setBadges(fetchedBadges.filter(Boolean) as BadgeWithMeta[]);
                        return;
                    }
                }
            }
            
            // No badges found
            setBadges([]);
        } catch (err) {
            console.error('Error loading public badges:', err);
            setBadges([]);
        }
    };

    const handleDelete = async (badge: BadgeWithMeta) => {
        if (!authenticated) {
            setPrMessage({ type: 'error', text: 'Please connect your GitHub account to delete badges.' });
            return;
        }

        const recipientName = badge.recipientName || badge.recipient.identity.split('@')[0];
        const confirmed = window.confirm(
            `Are you sure you want to revoke the "${badge.badge.name}" badge from ${recipientName}?\n\nThis will create a Pull Request to remove the badge.`
        );

        if (!confirmed) return;

        setDeleteInProgress(badge._filename);
        setPrMessage(null);

        const result = await deleteBadgePR(
            badge._filename,
            recipientName,
            badge.badge.name
        );

        if (result.success) {
            setPrMessage({
                type: 'success',
                text: 'Revocation PR created successfully!',
                url: result.prUrl
            });
        } else {
            setPrMessage({
                type: 'error',
                text: result.error || 'Failed to create revocation PR'
            });
        }

        setDeleteInProgress(null);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Badges</h1>
                    <p className="text-slate-600 mt-2">
                        {viewMode === 'public' 
                            ? 'Badges issued from this platform'
                            : repoConfig 
                                ? <>Badges from <code className="bg-slate-100 px-2 py-0.5 rounded text-sm">{repoConfig.owner}/{repoConfig.repo}</code></>
                                : 'Connect GitHub to view your badges'
                        }
                    </p>
                </div>
                <Link
                    to="/create"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <Award className="h-4 w-4" />
                    Issue New Badge
                </Link>
            </div>

            {/* View Mode Tabs */}
            <div className="mb-6 flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                <button
                    onClick={() => setViewMode('public')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        viewMode === 'public'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <Globe className="h-4 w-4" />
                    Public Badges
                </button>
                <button
                    onClick={() => setViewMode('my-repo')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        viewMode === 'my-repo'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    <FolderGit2 className="h-4 w-4" />
                    My Repository
                </button>
            </div>

            {/* Show message if My Repository selected but not configured */}
            {viewMode === 'my-repo' && !repoConfig && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <span className="text-amber-800">
                        <Link to="/settings" className="font-medium underline hover:no-underline">Connect your GitHub account</Link> to view and manage your badges.
                    </span>
                </div>
            )}

            {prMessage && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                    prMessage.type === 'success' 
                        ? 'bg-green-50 border border-green-200 text-green-800' 
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    {prMessage.type === 'success' ? (
                        <Award className="h-5 w-5 text-green-600" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span>{prMessage.text}</span>
                    {prMessage.url && (
                        <a
                            href={prMessage.url}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-auto flex items-center gap-1 text-green-700 hover:text-green-900 font-medium"
                        >
                            View PR <ExternalLink className="h-4 w-4" />
                        </a>
                    )}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-slate-600">Loading badges...</span>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-800 mb-2">Failed to Load Badges</h2>
                    <p className="text-red-700">{error}</p>
                    <button
                        onClick={loadBadges}
                        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            ) : badges.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center">
                    <Award className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-700 mb-2">No Badges Issued Yet</h2>
                    <p className="text-slate-500 mb-6">Start issuing badges to recognize achievements!</p>
                    <Link
                        to="/create"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <Award className="h-4 w-4" />
                        Issue Your First Badge
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {badges.map((badge) => {
                        const imageUrl = typeof badge.badge.image === 'string' 
                            ? badge.badge.image 
                            : badge.badge.image.id || '';
                        const recipientName = badge.recipientName || badge.recipient.identity.split('@')[0];
                        const badgeId = badge._filename.replace('.json', '');
                        
                        return (
                            <div
                                key={badge.id}
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                            >
                                <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center relative">
                                    <img
                                        src={imageUrl}
                                        alt={badge.badge.name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Badge';
                                        }}
                                    />
                                    {viewMode === 'my-repo' && authenticated && (
                                        <button
                                            onClick={() => handleDelete(badge)}
                                            disabled={deleteInProgress === badge._filename}
                                            className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                            title="Revoke Badge"
                                        >
                                            {deleteInProgress === badge._filename ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </button>
                                    )}
                                </div>
                                
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-1">
                                        {badge.badge.name}
                                    </h3>
                                    
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                                        <User className="h-4 w-4" />
                                        <span className="truncate">{recipientName}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(badge.issuedOn).toLocaleDateString()}</span>
                                    </div>
                                    
                                    {badge.skills && badge.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {badge.skills.slice(0, 3).map((skill, i) => (
                                                <span
                                                    key={i}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
                                                >
                                                    <Tag className="h-3 w-3" />
                                                    {skill}
                                                </span>
                                            ))}
                                            {badge.skills.length > 3 && (
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
                                                    +{badge.skills.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    
                                    <Link
                                        to={`/verify/${badgeId}`}
                                        className="block w-full text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        View & Verify
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BadgeGallery;


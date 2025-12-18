import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { BadgeAssertion } from '../types';
import { CheckCircle, AlertCircle, Calendar, User, Share2, Linkedin, Tag, Clock, Building } from 'lucide-react';

const BadgeView: React.FC = () => {
    const { badgeId } = useParams<{ badgeId: string }>();
    const [badgeData, setBadgeData] = useState<BadgeAssertion | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBadge = async () => {
            if (!badgeId) return;

            try {
                setLoading(true);
                // Construct URL: if it's a full URL, use it; otherwise assume local /badges/ path
                const url = badgeId.startsWith('http')
                    ? badgeId
                    : `${import.meta.env.BASE_URL}badges/${badgeId}.json`;

                const response = await fetch(url);
                if (!response.ok) {
                    // Fallback for local development or different base path
                    const localUrl = `badges/${badgeId}.json`;
                    const localResponse = await fetch(localUrl);
                    if (!localResponse.ok) throw new Error('Badge not found');
                    const data = await localResponse.json();
                    setBadgeData(data);
                    return;
                }

                const data = await response.json();
                setBadgeData(data);
            } catch (err) {
                console.error(err);
                setError('Could not verify badge. It may be missing or invalid.');
            } finally {
                setLoading(false);
            }
        };

        fetchBadge();
    }, [badgeId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !badgeData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
                <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Verification Failed</h2>
                <p className="text-slate-600 max-w-md">{error}</p>
            </div>
        );
    }

    const { badge, recipient, issuedOn, recipientName, skills, expiresOn } = badgeData;
    const imageUrl = typeof badge.image === 'string' ? badge.image : badge.image.id || '';
    const displayName = recipientName || recipient.identity.split('@')[0];
    const isExpired = expiresOn && new Date(expiresOn) < new Date();

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                {/* Banner Status */}
                <div className={`px-8 py-4 flex items-center gap-3 ${
                    isExpired 
                        ? 'bg-amber-50 border-b border-amber-100' 
                        : 'bg-green-50 border-b border-green-100'
                }`}>
                    {isExpired ? (
                        <>
                            <Clock className="h-6 w-6 text-amber-600" />
                            <span className="font-semibold text-amber-800">Badge Expired</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-6 w-6 text-green-600" />
                            <span className="font-semibold text-green-800">Verified & Valid Badge</span>
                        </>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-8 p-8 md:p-12">
                    {/* Left Column: Image */}
                    <div className="md:col-span-1 flex flex-col items-center">
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 w-full aspect-square flex items-center justify-center mb-6 shadow-inner">
                            <img
                                src={imageUrl}
                                alt={badge.name}
                                className="w-full h-full object-contain drop-shadow-lg"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Badge' }}
                            />
                        </div>
                        <div className="w-full space-y-3">
                            <button
                                className="w-full py-2.5 px-4 bg-[#0077b5] hover:bg-[#006097] text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                                onClick={() => {
                                    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(badge.name)}&organizationName=${encodeURIComponent(badge.issuer.name)}&issueYear=${new Date(issuedOn).getFullYear()}&issueMonth=${new Date(issuedOn).getMonth() + 1}&certUrl=${encodeURIComponent(window.location.href)}&certId=${badgeData.id.split('/').pop()?.replace('.json', '')}`;
                                    window.open(linkedInUrl, '_blank');
                                }}
                            >
                                <Linkedin className="h-5 w-5" />
                                Add to LinkedIn
                            </button>
                            <button
                                className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('URL copied to clipboard!');
                                }}
                            >
                                <Share2 className="h-5 w-5" />
                                Share Link
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">{badge.name}</h1>
                            <p className="text-lg text-slate-600 leading-relaxed">{badge.description}</p>
                        </div>

                        {/* Skills Tags */}
                        {(skills || badge.tags) && ((skills?.length ?? 0) > 0 || (badge.tags?.length ?? 0) > 0) && (
                            <div className="flex flex-wrap gap-2">
                                {(skills || badge.tags || []).map((skill, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                                    >
                                        <Tag className="h-3.5 w-3.5" />
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full">
                                <User className="h-4 w-4 text-slate-500" />
                                <span className="text-slate-500">Issued to:</span>
                                <span className="font-semibold text-slate-900">{displayName}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full">
                                <Calendar className="h-4 w-4 text-slate-500" />
                                <span className="text-slate-500">Date:</span>
                                <span className="font-semibold text-slate-900">{new Date(issuedOn).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            {expiresOn && (
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                                    isExpired ? 'bg-amber-50' : 'bg-slate-50'
                                }`}>
                                    <Clock className={`h-4 w-4 ${isExpired ? 'text-amber-500' : 'text-slate-500'}`} />
                                    <span className={isExpired ? 'text-amber-600' : 'text-slate-500'}>
                                        {isExpired ? 'Expired:' : 'Expires:'}
                                    </span>
                                    <span className={`font-semibold ${isExpired ? 'text-amber-800' : 'text-slate-900'}`}>
                                        {new Date(expiresOn).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Criteria</h3>
                            <p className="text-slate-600">{badge.criteria.narrative}</p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Issuer</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Building className="h-5 w-5 text-slate-400" />
                                    <span className="font-medium text-slate-900">{badge.issuer.name}</span>
                                </div>
                                <a href={badge.issuer.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">
                                    Visit Website
                                </a>
                            </div>
                        </div>

                        {/* Verification Details */}
                        <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                            <h4 className="text-sm font-semibold text-slate-700 mb-2">Verification Details</h4>
                            <div className="text-xs font-mono text-slate-500 break-all">
                                <div><strong>Badge ID:</strong> {badgeData.id}</div>
                                <div><strong>Verification Type:</strong> {badgeData.verification.type}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BadgeView;

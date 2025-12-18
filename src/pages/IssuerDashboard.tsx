import React, { useState } from 'react';
import type { BadgeAssertion } from '../types';
import { Copy, Download, Code, Info, Github, ExternalLink, Tag, X, Loader2, CheckCircle, Image } from 'lucide-react';
import { createBadgePR, isAuthenticated, getStoredRepoConfig, getAppConfig } from '../lib/github';
import { Link } from 'react-router-dom';

const IssuerDashboard: React.FC = () => {
    const [formData, setFormData] = useState({
        recipientName: '',
        recipientEmail: '',
        badgeName: '',
        badgeDescription: '',
        badgeImage: 'https://placehold.co/400x400?text=Badge',
        criteriaNarrative: '',
        issuerName: '',
        issuerUrl: '',
        issuerEmail: '',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: ''
    });

    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');
    const [generatedJson, setGeneratedJson] = useState<string>('');
    const [filename, setFilename] = useState<string>('');
    const [prStatus, setPrStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [prUrl, setPrUrl] = useState<string>('');
    const [prError, setPrError] = useState<string>('');

    const authenticated = isAuthenticated();
    const repoConfig = getStoredRepoConfig();
    const appConfig = getAppConfig();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addSkill = () => {
        const skill = skillInput.trim();
        if (skill && !skills.includes(skill)) {
            setSkills([...skills, skill]);
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleSkillKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    };

    const generateBadge = (e: React.FormEvent) => {
        e.preventDefault();
        setPrStatus('idle');
        setPrUrl('');
        setPrError('');

        // Generate filename using badge name + recipient's first name
        const badgeIdSlug = formData.badgeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        const firstName = formData.recipientName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]+/g, '');
        const generatedFilename = `${badgeIdSlug}-${firstName}.json`;
        setFilename(generatedFilename);

        // Use configured base URL or detect from window (include the base path)
        const basePath = import.meta.env.BASE_URL || '/';
        const baseUrl = appConfig.baseUrl || (window.location.origin + basePath.replace(/\/$/, ''));

        const assertion: BadgeAssertion & { "@context": string } = {
            "@context": "https://w3id.org/openbadges/v2",
            id: `${baseUrl}/badges/${generatedFilename}`,
            type: "Assertion",
            recipient: {
                type: "email",
                identity: formData.recipientEmail,
                hashed: false
            },
            recipientName: formData.recipientName,
            issuedOn: new Date(formData.issueDate).toISOString(),
            ...(formData.expiryDate && { expiresOn: new Date(formData.expiryDate).toISOString() }),
            badge: {
                id: `${baseUrl}/badges/class/${badgeIdSlug}.json`,
                type: "BadgeClass",
                name: formData.badgeName,
                description: formData.badgeDescription,
                image: formData.badgeImage,
                criteria: {
                    type: "Criteria",
                    narrative: formData.criteriaNarrative
                },
                issuer: {
                    id: `${baseUrl}/issuer.json`,
                    type: "Profile",
                    name: formData.issuerName,
                    url: formData.issuerUrl,
                    email: formData.issuerEmail
                },
                ...(skills.length > 0 && { tags: skills })
            },
            verification: {
                type: "HostedBadge"
            },
            ...(skills.length > 0 && { skills })
        };

        setGeneratedJson(JSON.stringify(assertion, null, 2));
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedJson);
        alert('JSON copied to clipboard!');
    };

    const downloadJson = () => {
        const blob = new Blob([generatedJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'badge.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const createPR = async () => {
        if (!generatedJson || !filename) return;

        setPrStatus('loading');
        setPrError('');

        const result = await createBadgePR(
            generatedJson,
            filename,
            formData.recipientName || formData.recipientEmail.split('@')[0],
            formData.badgeName
        );

        if (result.success && result.prUrl) {
            setPrStatus('success');
            setPrUrl(result.prUrl);
        } else {
            setPrStatus('error');
            setPrError(result.error || 'Failed to create PR');
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Issue a New Badge</h1>
                <p className="text-slate-600 mt-2">Fill out the details to generate and issue a compliant Open Badge.</p>
            </div>

            {/* GitHub Connection Status */}
            {!authenticated && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                    <Github className="h-5 w-5 text-amber-600" />
                    <span className="text-amber-800">
                        <Link to="/settings" className="font-medium underline hover:no-underline">Connect your GitHub account</Link> to automatically create PRs for badge issuance.
                    </span>
                </div>
            )}

            {authenticated && !repoConfig && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
                    <Github className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-800">
                        GitHub connected! <Link to="/settings" className="font-medium underline hover:no-underline">Select a repository</Link> to enable automatic PR creation.
                    </span>
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-12">
                <form onSubmit={generateBadge} className="space-y-6">
                    {/* Recipient Details */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-semibold mb-4 text-slate-800">1. Recipient Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                    required
                                    name="recipientName"
                                    value={formData.recipientName}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    type="text"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    required
                                    name="recipientEmail"
                                    value={formData.recipientEmail}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    type="email"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Badge Details */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-semibold mb-4 text-slate-800">2. Badge Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Badge Name</label>
                                <input
                                    required
                                    name="badgeName"
                                    value={formData.badgeName}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    type="text"
                                    placeholder="Certified Developer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    required
                                    name="badgeDescription"
                                    value={formData.badgeDescription}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Awarded for..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <Image className="h-4 w-4" />
                                    Badge Logo/Image URL
                                </label>
                                <input
                                    required
                                    name="badgeImage"
                                    value={formData.badgeImage}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    type="url"
                                    placeholder="https://example.com/badge-logo.png"
                                />
                                {formData.badgeImage && (
                                    <div className="mt-2 flex items-center gap-3">
                                        <img
                                            src={formData.badgeImage}
                                            alt="Badge preview"
                                            className="w-16 h-16 object-contain rounded-lg bg-slate-100 p-1"
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Preview' }}
                                        />
                                        <span className="text-xs text-slate-500">Preview of your badge logo</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Criteria Narrative</label>
                                <textarea
                                    required
                                    name="criteriaNarrative"
                                    value={formData.criteriaNarrative}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="To earn this badge, the recipient must..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Issue Date</label>
                                    <input
                                        required
                                        name="issueDate"
                                        value={formData.issueDate}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        type="date"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date (Optional)</label>
                                    <input
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        type="date"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-semibold mb-4 text-slate-800 flex items-center gap-2">
                            <Tag className="h-5 w-5" />
                            3. Skills & Tags
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Add Skills</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={handleSkillKeyDown}
                                        className="flex-1 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="e.g., Kubernetes, Cloud Native, DevOps"
                                    />
                                    <button
                                        type="button"
                                        onClick={addSkill}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                            {skills.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                        >
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(skill)}
                                                className="hover:text-blue-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Issuer Details */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-semibold mb-4 text-slate-800">4. Issuer Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Issuer Name</label>
                                <input
                                    required
                                    name="issuerName"
                                    value={formData.issuerName}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    type="text"
                                    placeholder="Organization Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Issuer URL</label>
                                <input
                                    required
                                    name="issuerUrl"
                                    value={formData.issuerUrl}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    type="url"
                                    placeholder="https://your-org.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Issuer Email</label>
                                <input
                                    required
                                    name="issuerEmail"
                                    value={formData.issuerEmail}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    type="email"
                                    placeholder="contact@your-org.com"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-200"
                    >
                        Generate Badge JSON
                    </button>
                </form>

                {/* Right Column: JSON Output & Actions */}
                <div className="space-y-6">
                    <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl shadow-xl overflow-hidden flex flex-col h-full max-h-[600px]">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-4">
                            <div className="flex items-center gap-2 text-white font-medium">
                                <Code className="h-5 w-5" />
                                <span>Badge JSON</span>
                            </div>
                            {generatedJson && (
                                <div className="flex gap-2">
                                    <button onClick={copyToClipboard} className="p-2 hover:bg-slate-800 rounded-lg transition-colors" title="Copy">
                                        <Copy className="h-5 w-5" />
                                    </button>
                                    <button onClick={downloadJson} className="p-2 hover:bg-slate-800 rounded-lg transition-colors" title="Download">
                                        <Download className="h-5 w-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {generatedJson ? (
                            <pre className="flex-grow overflow-auto font-mono text-sm custom-scrollbar">
                                {generatedJson}
                            </pre>
                        ) : (
                            <div className="flex-grow flex flex-col items-center justify-center text-slate-500 italic">
                                <Info className="h-12 w-12 mb-4 opacity-50" />
                                <p>Fill out the form to generate your badge JSON.</p>
                            </div>
                        )}
                    </div>

                    {/* Actions after JSON is generated */}
                    {generatedJson && (
                        <div className="space-y-4">
                            {/* Create PR Button */}
                            {authenticated && repoConfig ? (
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                        <Github className="h-5 w-5" />
                                        Automatic Issuance
                                    </h3>
                                    
                                    {prStatus === 'idle' && (
                                        <button
                                            onClick={createPR}
                                            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Github className="h-5 w-5" />
                                            Create Pull Request
                                        </button>
                                    )}

                                    {prStatus === 'loading' && (
                                        <div className="flex items-center justify-center py-3 text-slate-600">
                                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                            Creating PR...
                                        </div>
                                    )}

                                    {prStatus === 'success' && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
                                                <CheckCircle className="h-5 w-5" />
                                                <span>Pull Request created successfully!</span>
                                            </div>
                                            <a
                                                href={prUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                            >
                                                <ExternalLink className="h-5 w-5" />
                                                View & Merge PR
                                            </a>
                                        </div>
                                    )}

                                    {prStatus === 'error' && (
                                        <div className="space-y-3">
                                            <div className="text-red-700 bg-red-50 p-3 rounded-lg">
                                                {prError}
                                            </div>
                                            <button
                                                onClick={createPR}
                                                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    )}

                                    <p className="text-xs text-slate-500 mt-3">
                                        PR will be created in <code className="bg-slate-100 px-1 rounded">{repoConfig.owner}/{repoConfig.repo}</code>
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm leading-relaxed">
                                    <strong>Manual Steps:</strong>
                                    <ol className="list-decimal ml-4 mt-2 space-y-1">
                                        <li>Download the JSON file.</li>
                                        <li>Upload it to the <code>public/badges/</code> directory in your repository.</li>
                                        <li>Commit and push the changes.</li>
                                        <li>Your badge will be verified at <code>/verify/{filename.replace('.json', '')}</code>.</li>
                                    </ol>
                                    <div className="mt-4 pt-3 border-t border-amber-200">
                                        <Link to="/settings" className="text-amber-900 font-medium underline hover:no-underline">
                                            Connect GitHub to automate this process →
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IssuerDashboard;

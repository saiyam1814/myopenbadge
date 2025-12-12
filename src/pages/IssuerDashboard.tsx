import React, { useState } from 'react';
import type { BadgeAssertion } from '../types';
import { Copy, Download, Code, Info } from 'lucide-react';

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
        issueDate: new Date().toISOString().split('T')[0]
    });

    const [generatedJson, setGeneratedJson] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const generateBadge = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic ID generation logic - in a real app this might be UUIDs
        const badgeIdSlug = formData.badgeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const recipientSlug = formData.recipientEmail.split('@')[0];
        const filename = `${badgeIdSlug}-${recipientSlug}.json`;
        const baseUrl = window.location.origin + window.location.pathname.replace('/create', '');

        const assertion: BadgeAssertion = {
            "@context": "https://w3id.org/openbadges/v2",
            id: `${baseUrl}/badges/${filename}`,
            type: "Assertion",
            recipient: {
                type: "email",
                identity: formData.recipientEmail,
                hashed: false
            },
            issuedOn: new Date(formData.issueDate).toISOString(),
            badge: {
                id: `${baseUrl}/badges/class/${badgeIdSlug}.json`, // Simplified: assuming class is embedded or separate
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
                }
            },
            verification: {
                type: "HostedBadge"
            }
        } as any; // Type assertion to include @context which isn't in our interface but needed for standard

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
        // Suggest a filename based on the content
        try {
            const data = JSON.parse(generatedJson);
            const suggestedName = data.id.split('/').pop();
            link.download = suggestedName || 'badge.json';
        } catch (e) {
            link.download = 'badge.json';
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Issue a New Badge</h1>
                <p className="text-slate-600 mt-2">Fill out the details to generate a compliant Open Badge JSON file.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                <form onSubmit={generateBadge} className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-semibold mb-4 text-slate-800">1. Recipient Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name (Internal)</label>
                                <input required name="recipientName" value={formData.recipientName} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" type="text" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email (Identity)</label>
                                <input required name="recipientEmail" value={formData.recipientEmail} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" type="email" placeholder="john@example.com" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-semibold mb-4 text-slate-800">2. Badge Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Badge Name</label>
                                <input required name="badgeName" value={formData.badgeName} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" type="text" placeholder="Certified Developer" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea required name="badgeDescription" value={formData.badgeDescription} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" rows={3} placeholder="Awarded for..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                                <input required name="badgeImage" value={formData.badgeImage} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" type="url" placeholder="https://..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Criteria Narrative</label>
                                <textarea required name="criteriaNarrative" value={formData.criteriaNarrative} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" rows={3} placeholder="To earn this badge..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Issue Date</label>
                                <input required name="issueDate" value={formData.issueDate} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" type="date" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-semibold mb-4 text-slate-800">3. Issuer Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Issuer Name</label>
                                <input required name="issuerName" value={formData.issuerName} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" type="text" placeholder="Organization / Name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Issuer URL</label>
                                <input required name="issuerUrl" value={formData.issuerUrl} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" type="url" placeholder="https://..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Issuer Email</label>
                                <input required name="issuerEmail" value={formData.issuerEmail} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" type="email" placeholder="contact@org.com" />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-200">
                        Generate JSON
                    </button>
                </form>

                <div className="space-y-6">
                    <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl shadow-xl overflow-hidden flex flex-col h-full max-h-[800px]">
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

                    {generatedJson && (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm leading-relaxed">
                            <strong>Next Steps:</strong>
                            <ol className="list-decimal ml-4 mt-2 space-y-1">
                                <li>Download the JSON file.</li>
                                <li>Rename it to match the ID if needed (e.g. <code>my-badge.json</code>).</li>
                                <li>Upload it to the <code>public/badges/</code> directory in your repository.</li>
                                <li>Commit sends push the changes.</li>
                                <li>Your badge will be verified at <code>/verify/my-badge</code>.</li>
                            </ol>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IssuerDashboard;

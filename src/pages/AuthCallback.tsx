import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { handleOAuthCallback } from '../lib/github';

const AuthCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const processCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const error = searchParams.get('error');

            if (error) {
                setStatus('error');
                setErrorMessage(searchParams.get('error_description') || 'Authentication was cancelled');
                return;
            }

            if (!code || !state) {
                setStatus('error');
                setErrorMessage('Invalid callback parameters');
                return;
            }

            const success = await handleOAuthCallback(code, state);

            if (success) {
                setStatus('success');
                // Redirect to settings after a brief delay
                setTimeout(() => navigate('/settings'), 1500);
            } else {
                setStatus('error');
                setErrorMessage('Failed to complete authentication');
            }
        };

        processCallback();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-4">
                {status === 'loading' && (
                    <>
                        <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Connecting to GitHub</h1>
                        <p className="text-slate-600">Please wait while we complete the authentication...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Connected Successfully!</h1>
                        <p className="text-slate-600">Redirecting you to settings...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Authentication Failed</h1>
                        <p className="text-slate-600 mb-6">{errorMessage}</p>
                        <button
                            onClick={() => navigate('/settings')}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                        >
                            Return to Settings
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthCallback;


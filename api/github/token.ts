// Vercel Serverless Function for GitHub OAuth Token Exchange
// This keeps the client secret secure on the server side

interface RequestBody {
    code: string;
}

export default async function handler(req: Request): Promise<Response> {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body: RequestBody = await req.json();
        const { code } = body;

        if (!code) {
            return new Response(JSON.stringify({ error: 'Missing code parameter' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const clientId = process.env.GITHUB_CLIENT_ID;
        const clientSecret = process.env.GITHUB_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            return new Response(JSON.stringify({ error: 'GitHub OAuth not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code
            })
        });

        if (!tokenResponse.ok) {
            throw new Error('Failed to exchange code for token');
        }

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            return new Response(JSON.stringify({ error: tokenData.error_description || tokenData.error }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ access_token: tokenData.access_token }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Token exchange error:', error);
        return new Response(JSON.stringify({ error: 'Token exchange failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export const config = {
    runtime: 'edge'
};


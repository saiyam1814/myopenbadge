import type { GitHubUser, PRCreationResult, AppConfig } from '../types';

// ============================================
// Personal Access Token Method
// ============================================
// User provides their own GitHub PAT for authentication

const PAT_KEY = 'github_personal_access_token';
const USER_KEY = 'github_user';
const REPO_KEY = 'github_repo_config';

export function setPersonalAccessToken(token: string): void {
    localStorage.setItem(PAT_KEY, token);
}

export function getPersonalAccessToken(): string | null {
    return localStorage.getItem(PAT_KEY);
}

export function clearPersonalAccessToken(): void {
    localStorage.removeItem(PAT_KEY);
}

export function hasPersonalAccessToken(): boolean {
    const token = getPersonalAccessToken();
    return !!token && token.length > 0;
}

// Validate a PAT by making a test API call
export async function validatePersonalAccessToken(token: string): Promise<GitHubUser | null> {
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

// Get app configuration from environment or detect from URL
export function getAppConfig(): AppConfig {
    // Include the base path (e.g., /myopenbadge/) in the URL
    const basePath = import.meta.env.BASE_URL || '/';
    const baseUrl = import.meta.env.VITE_BASE_URL || (window.location.origin + basePath.replace(/\/$/, ''));
    const repoOwner = import.meta.env.VITE_REPO_OWNER || '';
    const repoName = import.meta.env.VITE_REPO_NAME || '';
    
    return {
        baseUrl,
        repoOwner,
        repoName,
        badgesPath: 'public/badges'
    };
}

export function getAccessToken(): string | null {
    return getPersonalAccessToken();
}

export function getStoredUser(): GitHubUser | null {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
}

export function getStoredRepoConfig(): { owner: string; repo: string } | null {
    const stored = localStorage.getItem(REPO_KEY);
    return stored ? JSON.parse(stored) : null;
}

export function setRepoConfig(owner: string, repo: string): void {
    localStorage.setItem(REPO_KEY, JSON.stringify({ owner, repo }));
}

export function logout(): void {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REPO_KEY);
    localStorage.removeItem(PAT_KEY);
}

export function isAuthenticated(): boolean {
    return hasPersonalAccessToken();
}

// GitHub API Functions
export async function createBadgePR(
    badgeJson: string,
    filename: string,
    recipientName: string,
    badgeName: string
): Promise<PRCreationResult> {
    const token = getAccessToken();
    const repoConfig = getStoredRepoConfig();
    
    if (!token || !repoConfig) {
        return { success: false, error: 'Not authenticated or repo not configured' };
    }
    
    const { owner, repo } = repoConfig;
    const branchName = `badge/${filename.replace('.json', '')}-${Date.now()}`;
    
    try {
        // 1. Get default branch SHA
        const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        
        if (!repoResponse.ok) throw new Error('Failed to fetch repo info');
        const repoData = await repoResponse.json();
        const defaultBranch = repoData.default_branch;
        
        // 2. Get reference to default branch
        const refResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${defaultBranch}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!refResponse.ok) throw new Error('Failed to get branch reference');
        const refData = await refResponse.json();
        const baseSha = refData.object.sha;
        
        // 3. Create new branch
        const createBranchResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/git/refs`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ref: `refs/heads/${branchName}`,
                    sha: baseSha
                })
            }
        );
        
        if (!createBranchResponse.ok) throw new Error('Failed to create branch');
        
        // 4. Create/update file in new branch
        const content = btoa(unescape(encodeURIComponent(badgeJson)));
        const filePath = `public/badges/${filename}`;
        
        const createFileResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `🏅 Issue badge: ${badgeName} to ${recipientName}`,
                    content,
                    branch: branchName
                })
            }
        );
        
        if (!createFileResponse.ok) throw new Error('Failed to create badge file');
        
        // 5. Create Pull Request
        const prResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/pulls`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: `🏅 Issue Badge: ${badgeName} to ${recipientName}`,
                    body: `## New Badge Issuance\n\n**Badge:** ${badgeName}\n**Recipient:** ${recipientName}\n\n---\n\n*This PR was automatically generated by OpenBadge Issuer.*`,
                    head: branchName,
                    base: defaultBranch
                })
            }
        );
        
        if (!prResponse.ok) throw new Error('Failed to create PR');
        const prData = await prResponse.json();
        
        return { success: true, prUrl: prData.html_url };
    } catch (error) {
        console.error('PR creation error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function deleteBadgePR(
    filename: string,
    recipientName: string,
    badgeName: string
): Promise<PRCreationResult> {
    const token = getAccessToken();
    const repoConfig = getStoredRepoConfig();
    
    if (!token || !repoConfig) {
        return { success: false, error: 'Not authenticated or repo not configured' };
    }
    
    const { owner, repo } = repoConfig;
    const branchName = `revoke/${filename.replace('.json', '')}-${Date.now()}`;
    
    try {
        // 1. Get default branch
        const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        
        if (!repoResponse.ok) throw new Error('Failed to fetch repo info');
        const repoData = await repoResponse.json();
        const defaultBranch = repoData.default_branch;
        
        // 2. Get current file SHA (needed for deletion)
        const filePath = `public/badges/${filename}`;
        const fileResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!fileResponse.ok) throw new Error('Badge file not found');
        const fileData = await fileResponse.json();
        const fileSha = fileData.sha;
        
        // 3. Get reference to default branch
        const refResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${defaultBranch}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!refResponse.ok) throw new Error('Failed to get branch reference');
        const refData = await refResponse.json();
        const baseSha = refData.object.sha;
        
        // 4. Create new branch
        const createBranchResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/git/refs`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ref: `refs/heads/${branchName}`,
                    sha: baseSha
                })
            }
        );
        
        if (!createBranchResponse.ok) throw new Error('Failed to create branch');
        
        // 5. Delete file in new branch
        const deleteFileResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `🚫 Revoke badge: ${badgeName} from ${recipientName}`,
                    sha: fileSha,
                    branch: branchName
                })
            }
        );
        
        if (!deleteFileResponse.ok) throw new Error('Failed to delete badge file');
        
        // 6. Create Pull Request
        const prResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/pulls`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: `🚫 Revoke Badge: ${badgeName} from ${recipientName}`,
                    body: `## Badge Revocation\n\n**Badge:** ${badgeName}\n**Recipient:** ${recipientName}\n\n---\n\n*This PR was automatically generated by OpenBadge Issuer.*`,
                    head: branchName,
                    base: defaultBranch
                })
            }
        );
        
        if (!prResponse.ok) throw new Error('Failed to create PR');
        const prData = await prResponse.json();
        
        return { success: true, prUrl: prData.html_url };
    } catch (error) {
        console.error('Delete PR creation error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// Fetch all badges from repository
export async function fetchBadgesFromRepo(): Promise<{ badges: any[]; error?: string }> {
    const token = getAccessToken();
    const repoConfig = getStoredRepoConfig();
    
    if (!repoConfig) {
        return { badges: [], error: 'Repository not configured' };
    }
    
    const { owner, repo } = repoConfig;
    const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json'
    };
    
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    
    try {
        // Get list of files in badges directory
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/public/badges`,
            { headers }
        );
        
        if (!response.ok) {
            if (response.status === 404) {
                return { badges: [] };
            }
            throw new Error('Failed to fetch badges directory');
        }
        
        const files = await response.json();
        const jsonFiles = files.filter((f: any) => f.name.endsWith('.json'));
        
        // Fetch each badge file content
        const badges = await Promise.all(
            jsonFiles.map(async (file: any) => {
                try {
                    const contentResponse = await fetch(file.download_url);
                    if (!contentResponse.ok) return null;
                    const badgeData = await contentResponse.json();
                    return { ...badgeData, _filename: file.name };
                } catch {
                    return null;
                }
            })
        );
        
        return { badges: badges.filter(Boolean) };
    } catch (error) {
        console.error('Error fetching badges:', error);
        return { badges: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// Fetch user's repositories
export async function fetchUserRepos(): Promise<{ name: string; full_name: string; owner: { login: string } }[]> {
    const token = getAccessToken();
    if (!token) return [];
    
    try {
        const response = await fetch(
            'https://api.github.com/user/repos?per_page=100&sort=updated',
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!response.ok) return [];
        return await response.json();
    } catch {
        return [];
    }
}

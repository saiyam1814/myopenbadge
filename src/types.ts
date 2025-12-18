export interface BadgeProfile {
    id: string;
    type: 'Profile';
    name: string;
    url: string;
    email?: string;
    description?: string;
    image?: string;
}

export interface BadgeImage {
    id?: string;
    type?: 'Image';
    caption?: string;
}

export interface BadgeCriteria {
    id?: string;
    type: 'Criteria';
    narrative: string;
}

export interface Skill {
    name: string;
    category?: string;
}

export interface BadgeClass {
    id: string;
    type: 'BadgeClass';
    name: string;
    description: string;
    image: string | BadgeImage;
    criteria: BadgeCriteria;
    issuer: BadgeProfile;
    tags?: string[];  // Skills/tags for the badge
}

export interface BadgeIdentityObject {
    type: 'email';
    identity: string;
    salt?: string;
    hashed: boolean;
}

export interface BadgeAssertion {
    id: string;
    type: 'Assertion';
    recipient: BadgeIdentityObject;
    recipientName?: string;  // Display name of recipient
    issuedOn: string;
    expiresOn?: string;  // Optional expiration date
    badge: BadgeClass;
    verification: {
        type: 'HostedBadge';
        url?: string;
    };
    narrative?: string;
    evidence?: {
        id: string;
        narrative?: string;
    }[];
    skills?: string[];  // Skills earned with this badge
}

// GitHub Integration Types
export interface GitHubUser {
    login: string;
    id: number;
    avatar_url: string;
    name: string | null;
    email: string | null;
}

export interface GitHubRepo {
    owner: string;
    name: string;
    defaultBranch: string;
    fullName: string;
}

export interface GitHubConfig {
    clientId: string;
    redirectUri: string;
    scope: string;
}

export interface PRCreationResult {
    success: boolean;
    prUrl?: string;
    error?: string;
}

// Badge Template (for reusable badge definitions)
export interface BadgeTemplate {
    id: string;
    name: string;
    description: string;
    image: string;  // Logo/image URL
    criteria: string;
    skills: string[];
    issuer: {
        name: string;
        url: string;
        email: string;
    };
    createdAt: string;
}

// App Configuration
export interface AppConfig {
    baseUrl: string;
    repoOwner: string;
    repoName: string;
    badgesPath: string;
}

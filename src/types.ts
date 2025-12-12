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

export interface BadgeClass {
    id: string;
    type: 'BadgeClass';
    name: string;
    description: string;
    image: string | BadgeImage;
    criteria: BadgeCriteria;
    issuer: BadgeProfile;
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
    issuedOn: string;
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
}

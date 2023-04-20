import { client } from 'services/client';
import { getAuthPath } from 'utils/env-utils';

export interface AuthTokenResponse {
    IDToken: string;
    accessToken: string;
    credential: Credential;
    expires: number;
    role: string;
    sub: string;
}

export interface Credential {
    exp: number;
    ext: Ext;
    iss: string;
    sub: string;
}

export interface Ext {
    avatarURL: string;
    displayName: string;
    email: string;
    firstName: string;
    lastName: string;
    locale: string;
    orgs: string[];
}

export interface AuthTokenResponseReduced
    extends Pick<AuthTokenResponse, 'accessToken' | 'expires' | 'IDToken'> {
    ext: Ext;
}

export const authEndpoints = {
    session: {
        tokens: {
            read: () => {
                return client<AuthTokenResponse>(
                    `${getAuthPath()}/session/tokens`
                );
            },
        },
    },
};

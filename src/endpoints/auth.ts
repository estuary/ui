import { client } from 'services/client';
import { getAuthPath } from 'utils/env-utils';

export interface AuthTokenResponse {
    accessToken: string;
    credential: Credential;
    expires: number;
    IDToken: string;
    role: string;
    sub: string;
}

export interface Credential {
    iss: string;
    sub: string;
    exp: number;
    ext: Ext;
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

import { add, getUnixTime } from 'date-fns';

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
                return new Promise<AuthTokenResponseReduced>((resolve) => {
                    resolve({
                        accessToken: 'access_token_value',
                        ext: {
                            avatarURL: 'http://example.org',
                            displayName: 'Firstname Lastname',
                            email: 'userName@example.org',
                            firstName: 'Firstname',
                            lastName: 'Lastname',
                            locale: 'en',
                            orgs: ['example.org'],
                        },
                        expires: getUnixTime(
                            add(new Date(), {
                                years: 1,
                            })
                        ),
                        IDToken: 'id_token_value',
                    });
                });
                // return client<AuthTokenResponse>(
                //     `${getAuthPath()}/session/tokens`
                // );
            },
        },
    },
};

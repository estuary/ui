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

export const authEndpoints = {
    session: {
        tokens: {
            read: () => {
                return new Promise<AuthTokenResponse>((resolve) => {
                    resolve({
                        accessToken: 'access_token_value',
                        credential: {
                            iss: 'issuer_name',
                            sub: 'sub_number',
                            exp: 1648666124,
                            ext: {
                                avatarURL: 'http://example.org',
                                displayName: 'Firstname Lastname',
                                email: 'userName@example.org',
                                firstName: 'Firstname',
                                lastName: 'Lastname',
                                locale: 'en',
                                orgs: ['example.org'],
                            },
                        },
                        expires: 1648666124,
                        IDToken: 'id_token_value',
                        role: 'api_user',
                        sub: 'issuer_value|sub_value',
                    });
                });
                // return client<AuthTokenResponse>(
                //     `${getAuthPath()}/session/tokens`
                // );
            },
        },
    },
};

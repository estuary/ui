export interface AuthFile {
    email: string;
    legalDone: boolean;
    tenant: string | null;
}

export interface AuthProps extends AuthFile {
    name: string;
    filePath: string;
    saved: boolean;
    tenant: string;
}

export type StartSessionWithUserResponse = AuthProps;

export interface AuthFile {
    email: string;
    legalDone: boolean;
    tenant: string | null;
}

export interface BaseAuthProps {
    name: string;
    filePath: string;
    saved: boolean;
}

export interface AuthProps extends AuthFile, BaseAuthProps {
    tenant: string;
}

export interface StartSessionWithUserResponse extends AuthFile, BaseAuthProps {
    tenant: string | null;
}

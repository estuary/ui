import type { ButtonProps } from '@mui/material';
import type { Schema } from 'src/types';
import type { SupportedProvider } from 'src/types/authProviders';

export type LoginFunction = (
    provider: SupportedProvider,
    scopes: string,
    params?: Schema
) => Promise<void>;

export interface LoginProps {
    isRegister?: boolean;
}

export interface LoginProvidersProps extends LoginProps {
    grantToken?: string;
    providers?: SupportedProvider[];
}

export interface LoginButtonProps extends LoginProps {
    login: LoginFunction;
    provider: SupportedProvider;
}

export interface ProviderButtonProps extends ButtonProps, LoginProps {
    login: (params?: any) => Promise<void>;
}

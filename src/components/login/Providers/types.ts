import { ButtonProps } from '@mui/material';
import { Schema } from 'types';
import { SupportedProvider } from 'types/authProviders';

export interface LoginProvidersProps {
    isRegister?: boolean;
    grantToken?: string;
    providers?: SupportedProvider[];
}

export interface LoginButtonProps {
    login: LoginFunction;
    provider: SupportedProvider;
    isRegister?: boolean;
}

export interface ProviderButtonProps extends ButtonProps {
    login: (params?: any) => Promise<void>;
    isRegister?: boolean;
}

export type LoginFunction = (
    provider: SupportedProvider,
    scopes: string,
    params?: Schema
) => Promise<void>;

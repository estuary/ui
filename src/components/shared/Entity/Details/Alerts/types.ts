import type { Alert } from 'src/types/gql';

export interface AlertDetail {
    label: string;
    dataVal: any;
    key: string;
}

export interface AlertTypeContent {
    detail: AlertDetail | null;
    humanReadable: string;
    firedAtReadable: string;
    resolvedAtReadable: string;
    docLink?: string;
}

export interface AlertCardProps {
    datum: Alert;
}

export interface AlertCardHeaderProps {
    datum: Alert;
}

export interface AlertDetailsWrapperProps {
    datum: Alert;
}

export interface AlertDetailsProps extends AlertDetailsWrapperProps {
    detail: AlertDetail;
}

import type { ChipDisplay } from 'src/components/shared/ChipList/types';
import type { Alert, DefaultAlertingQueryResponse } from 'src/types/gql';

export interface AlertDetail {
    label: string;
    dataVal: any;
    key: string;
}

export interface AlertTypeContent {
    detail: AlertDetail | null;
    humanReadable: string;
    firedAtReadable: string;
    recipientList: ChipDisplay[];
    resolvedAtReadable: string;
    docLink?: string;
}

export interface AlertCardProps {
    datum: Alert;
}

export type AlertCardHeaderProps = AlertCardProps;

export interface AlertDetailsWrapperProps {
    datum: Alert;
    hideLabel?: boolean;
    short?: boolean;
}

export interface AlertDetailsProps extends AlertDetailsWrapperProps {
    detail: AlertDetail;
}

export interface ServerErrorProps {
    datum: Alert;
    detail: AlertDetail;
    short?: boolean;
}

export interface AlertCardGridProps {
    edges: DefaultAlertingQueryResponse['alerts']['edges'];
}

export type ServerErrorDialogProps = AlertDetailsProps;

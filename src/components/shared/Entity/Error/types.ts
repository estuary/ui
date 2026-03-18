import type { LogProps } from 'src/components/logs';
import type { ErrorProps } from 'src/components/shared/Error';

export interface DraftErrorProps {
    draftId?: string | null;
    enablePolling?: boolean;
    enableAlertStyling?: boolean;
    maxErrors?: number;
}

export interface EntityErrorProps {
    title: string;
    error?: ErrorProps['error'];
    logToken?: ErrorLogsProps['logToken'];
    draftId?: DraftErrorProps['draftId'];
}

export interface ErrorLogsProps {
    logToken?: string | null;
    defaultOpen?: boolean;
    height?: number;
    logProps?: Omit<LogProps, 'token' | 'height'>;
}

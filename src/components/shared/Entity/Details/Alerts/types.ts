import type { Alert } from 'src/types/gql';

export interface AlertCardProps {
    datum: Alert;
}

export interface AlertCardHeaderProps {
    alertType: Alert['alertType'];
}

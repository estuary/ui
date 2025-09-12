import type { EmotionJSX } from '@emotion/react/dist/declarations/src/jsx-namespace';
import type { Alert } from 'src/types/gql';

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
    details: any[];
}
export type DetailsComponent = (props: AlertDetailsProps) => EmotionJSX.Element;

export interface AlertTypeContent {
    details: any[];
    humanReadable: string;
    firedAtReadable: string;
    resolvedAtReadable: string;
    docLink?: string;
    DetailSection?: DetailsComponent;
}

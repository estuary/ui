import type { EmotionJSX } from '@emotion/react/dist/declarations/src/jsx-namespace';
import type { Alert } from 'src/types/gql';

export interface AlertCardProps {
    datum: Alert;
}

export interface AlertCardHeaderProps {
    datum: Alert;
}

export interface AlertDetailsProps {
    datum: Alert;
}

export interface FooDetailsProps extends AlertDetailsProps {
    details: any[];
}
export type DetailsComponent = (props: FooDetailsProps) => EmotionJSX.Element;

export interface AlertTypeContent {
    details: any[];
    humanReadable: string;
    firedAtReadable: string;
    resolvedAtReadable: string;
    docLink?: string;
    DetailSection?: DetailsComponent;
}

import { InternationalizedString } from 'types';

export interface ConnectorTag {
    connectors: {
        detail: string;
        image_name: string;
        title: InternationalizedString;
        short_description: InternationalizedString;
        logo_url: InternationalizedString;
        recommended: boolean | null;
    };
    id: string;
    connector_id: string;
    image_tag: string;
    protocol: string;
    title: string;
}

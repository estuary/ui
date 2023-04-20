import { InternationalizedString } from 'types';

export interface ConnectorTag {
    connector_id: string;
    connectors: {
        detail: string;
        image_name: string;
        logo_url: InternationalizedString;
        recommended: boolean | null;
        short_description: InternationalizedString;
        title: InternationalizedString;
    };
    id: string;
    image_tag: string;
    protocol: string;
    title: string;
}
export const CONNECTOR_TAG_QUERY = `
    id,
    connector_id,
    image_tag,
    protocol,
    endpoint_spec_schema->>title,
    connectors(image_name, title, short_description, logo_url, recommended)
`;

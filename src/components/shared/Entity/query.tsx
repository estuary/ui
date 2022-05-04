import { OpenGraph } from 'types';

export interface ConnectorTag {
    connectors: {
        detail: string;
        image_name: string;
        open_graph: OpenGraph;
    };
    id: string;
    connector_id: string;
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
    connectors(detail, image_name, open_graph)
`;

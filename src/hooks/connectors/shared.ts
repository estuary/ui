import { EntityWithCreateWorkflow, Schema } from 'types';
import { CONNECTOR_NAME, CONNECTOR_RECOMMENDED } from 'services/supabase';
import { ConnectorTag_Base } from 'api/connectors';

//////////////////////////
// useConnectors
//////////////////////////
export interface Connector {
    id: string;
    title: { 'en-US': string };
    image_name: string;
}

export const CONNECTOR_QUERY = `
    id, title, image_name
`;

//////////////////////////////
// useConnectorTag
//////////////////////////////
export const CONNECTOR_TAG_QUERY = `
    connectors(
        image_name
    ),
    id,
    connector_id,
    image_tag,
    endpoint_spec_schema, 
    resource_spec_schema, 
    documentation_url
`;

export interface ConnectorTag {
    connectors: {
        image_name: string;
    };
    id: string;
    connector_id: string;
    image_tag: string;
    endpoint_spec_schema: Schema;
    resource_spec_schema: string;
    documentation_url: string;
}

//////////////////////////////////////////////
// useConnectorWithTagDetail
//////////////////////////////////////////////
export interface ConnectorTagWithDetailTags extends ConnectorTag_Base {
    documentation_url: string;
    protocol: EntityWithCreateWorkflow;
    image_name: string;
    title: string;
}

export interface ConnectorWithTagDetailQuery {
    connector_tags: ConnectorTagWithDetailTags[];
    id: string;
    detail: string;
    image_name: string;
    image: string;
    recommended: boolean;
    title: string;
    // FILTERING TYPES HACK
    ['connector_tags.protocol']: undefined;
    ['connector_tags.image_tag']: undefined;
    [CONNECTOR_NAME]: undefined;
}

export const CONNECTOR_WITH_TAG_QUERY = `
    id,
    detail,
    image_name,
    image:logo_url->>en-US::text,
    ${CONNECTOR_RECOMMENDED},
    title:${CONNECTOR_NAME}::text,
    connector_tags !inner(
        documentation_url,
        protocol,
        image_tag,
        id,
        connector_id,
        endpoint_spec_schema->>title
    )
`;

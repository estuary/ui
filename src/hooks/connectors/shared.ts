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

/////////////////////////////////
// useConnectorsExist
/////////////////////////////////
export interface ConnectorsExist {
    id: string;
    // FILTERING TYPES HACK
    ['connector_tags.protocol']: undefined;
    [CONNECTOR_RECOMMENDED]: undefined;
    [CONNECTOR_NAME]: undefined;
}

export const CONNECTORS_EXIST_QUERY = `
    image_name,
    connector_tags !inner(
        protocol
    )
`;

export const CONNECTOR_TAG_QUERY = `
    connectors(
        image_name
    ),
    connector_id,
    default_capture_interval,
    documentation_url
    endpoint_spec_schema, 
    id,
    image_tag,
    resource_spec_schema,
`;

export interface ConnectorTag {
    connectors: {
        image_name: string;
    };
    connector_id: string;
    default_capture_interval: any | null; //interval
    documentation_url: string;
    endpoint_spec_schema: Schema;
    id: string;
    image_tag: string;
    resource_spec_schema: Schema;
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

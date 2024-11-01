import { ConnectorTag_Base } from 'api/connectors';
import { CONNECTOR_NAME, CONNECTOR_RECOMMENDED } from 'services/supabase';
import { EntityWithCreateWorkflow, Schema } from 'types';

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

//////////////////////////////
// useConnectorTag
//////////////////////////////
export const CONNECTOR_TAG_COLS = [
    `connectors(
        image_name
    )`,
    'id',
    'connector_id',
    // 'default_capture_interval',
    'image_tag',
    'endpoint_spec_schema',
    // 'resource_spec_schema', //not used right now (Q3 2024)
    'documentation_url',
];
export const CONNECTOR_TAG_QUERY = CONNECTOR_TAG_COLS.join(',');

export interface ConnectorTag {
    connectors: {
        image_name: string;
    };
    disable_backfill: boolean;
    id: string;
    connector_id: string;
    default_capture_interval: string | null;
    image_tag: string;
    endpoint_spec_schema: Schema;
    resource_spec_schema: Schema;
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

const CONNECTOR_TAG_INNER_COLS = [
    'connector_id',
    'documentation_url',
    'endpoint_spec_schema->>title',
    'id',
    'image_tag',
    'protocol',
];
export const CONNECTOR_WITH_TAG_QUERY = `
    ${CONNECTOR_RECOMMENDED},
    id,
    detail,
    image_name,
    image:logo_url->>en-US::text,
    title:${CONNECTOR_NAME}::text,
    connector_tags !inner(${CONNECTOR_TAG_INNER_COLS.join(',')})
`;

import type { CONNECTOR_NAME, CONNECTOR_RECOMMENDED } from 'src/api/shared';

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

export const CONNECTOR_NAME = `title->>en-US`;
export const CONNECTOR_DETAILS = `detail`;
export const CONNECTOR_RECOMMENDED = `recommended`;
export const CONNECTOR_TITLE = `title:connector_title->>en-US`;
export const CONNECTOR_IMAGE = `image:connector_logo_url->>en-US`;

// TODO (endpoints) - we need to start moving these lists out of the `services/supabase`
//  file and into here. Do not really like the name `shared` but it follows the standard.
const CONNECTOR_TAG_INNER_COLS = [
    'connector_id',
    'documentation_url',
    'endpoint_spec_schema',
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

export const OAUTH_OPERATIONS = {
    AUTH_URL: 'auth-url',
    ACCESS_TOKEN: 'access-token',
    ENCRYPT_CONFIG: 'encrypt-config',
};

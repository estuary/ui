import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { Schema } from 'types';

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

// TODO (Typing)
// Since the typing looks at columns it was a pain to make this
//  truly reusable. So marking the query as `any` even thogh
//  it is PostgrestFilterBuilder<ConnectorTag |ConnectorWithTagDetailQuery>
export const connectorHasRequiredColumns = <T>(
    query: PostgrestFilterBuilder<any>,
    columnPrefix?: string
): PostgrestFilterBuilder<T> => {
    return query
        .not(`${columnPrefix ? `${columnPrefix}.` : ''}image_tag`, 'is', null)
        .not(
            `${columnPrefix ? `${columnPrefix}.` : ''}resource_spec_schema`,
            'is',
            null
        )
        .not(
            `${columnPrefix ? `${columnPrefix}.` : ''}endpoint_spec_schema`,
            'is',
            null
        );
};

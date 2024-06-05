// TODO (Typing)
// Since the typing looks at columns it was a pain to make this
//  truly reusable. So marking the query as `any` even thogh
//  it is PostgrestFilterBuilder<ConnectorTag |ConnectorWithTagDetailQuery>

import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

// PostgrestFilterBuilder<any, any, T, any, any>
// PostgrestFilterBuilder<any, any, T, any, any>
export const requiredConnectorColumnsExist = (
    query: any,
    columnPrefix?: string
): PostgrestFilterBuilder<any, any, any, any, any> => {
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

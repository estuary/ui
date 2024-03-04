import {
    CONNECTOR_WITH_TAG_QUERY,
    ConnectorWithTagDetailQuery,
} from 'hooks/useConnectorWithTagDetail';
import {
    CONNECTOR_NAME,
    CONNECTOR_RECOMMENDED,
    TABLES,
    defaultTableFilter,
    handleFailure,
    handleSuccess,
    supabaseClient,
    supabaseRetry,
    CONNECTOR_DETAILS,
} from 'services/supabase';
import { SortDirection } from 'types';

// Table-specific queries
const getConnectors = (
    searchQuery: any,
    sortDirection: SortDirection,
    protocol: string | null
) => {
    let queryBuilder = supabaseClient
        .from<ConnectorWithTagDetailQuery>(TABLES.CONNECTORS)
        .select(CONNECTOR_WITH_TAG_QUERY);

    queryBuilder = defaultTableFilter<ConnectorWithTagDetailQuery>(
        queryBuilder,
        [CONNECTOR_NAME, CONNECTOR_DETAILS],
        searchQuery,
        [
            {
                col: CONNECTOR_RECOMMENDED,
                direction: 'desc',
            },
            {
                col: CONNECTOR_NAME,
                direction: sortDirection,
            },
        ],
        undefined,
        { column: 'connector_tags.protocol', value: protocol }
    );

    return queryBuilder;
};

// Hydration-specific queries
export interface ConnectorTag_Base {
    id: string;
    connector_id: string;
    image_tag: string;
}

export interface ConnectorsQuery_DetailsForm {
    id: string;
    image_name: string;
    logo_url: string;
    connector_tags: ConnectorTag_Base[];
}

const DETAILS_FORM_QUERY = `
    id,
    image_name,
    logo_url:logo_url->>en-US::text,
    connector_tags !inner(
        id,
        connector_id,
        image_tag
    )
`;

const getConnectors_detailsForm = async (connectorId: string) => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.CONNECTORS)
                .select(DETAILS_FORM_QUERY)
                .eq('id', connectorId)
                .eq('connector_tags.connector_id', connectorId),
        'getConnectors_detailsForm'
    ).then(handleSuccess<ConnectorsQuery_DetailsForm[]>, handleFailure);

    return data;
};

export { getConnectors, getConnectors_detailsForm };

import {
    CONNECTOR_WITH_TAG_QUERY,
    ConnectorWithTagDetailQuery,
} from 'hooks/useConnectorWithTagDetail';
import {
    CONNECTOR_NAME,
    SortingProps,
    TABLES,
    defaultTableFilter,
    handleFailure,
    handleSuccess,
    supabaseClient,
} from 'services/supabase';

// Table-specific queries
const getConnectors = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    let queryBuilder = supabaseClient
        .from<ConnectorWithTagDetailQuery>(TABLES.CONNECTORS)
        .select(CONNECTOR_WITH_TAG_QUERY, {
            count: 'exact',
        });

    queryBuilder = defaultTableFilter<ConnectorWithTagDetailQuery>(
        queryBuilder,
        [CONNECTOR_NAME],
        searchQuery,
        sorting,
        { pagination }
    );

    return queryBuilder;
};

// Hydration-specific queries
export interface ConnectorsQuery_DetailsForm {
    id: string;
    image_name: string;
    logo_url: string;
    connector_tags: {
        id: string;
        connector_id: string;
        image_tag: string;
    }[];
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
    const data = await supabaseClient
        .from(TABLES.CONNECTORS)
        .select(DETAILS_FORM_QUERY)
        .eq('id', connectorId)
        .eq('connector_tags.connector_id', connectorId)
        .then(handleSuccess<ConnectorsQuery_DetailsForm[]>, handleFailure);

    return data;
};

export { getConnectors, getConnectors_detailsForm };

import { supabaseClient } from 'context/GlobalProviders';
import {
    CONNECTOR_WITH_TAG_QUERY,
    ConnectorWithTagDetailQuery,
} from 'hooks/connectors/shared';
import {
    CONNECTOR_NAME,
    CONNECTOR_RECOMMENDED,
    TABLES,
    defaultTableFilter,
    handleFailure,
    handleSuccess,
    supabaseRetry,
    CONNECTOR_DETAILS,
} from 'services/supabase';
import { SortDirection } from 'types';
import { requiredConnectorColumnsExist } from 'utils/connector-utils';

// Table-specific queries
const getConnectors = (
    searchQuery: any,
    sortDirection: SortDirection,
    protocol: string | null
) => {
    // TODO (V2 typing) - need a way to handle single vs multiple responses
    return requiredConnectorColumnsExist<ConnectorWithTagDetailQuery>(
        defaultTableFilter<ConnectorWithTagDetailQuery>(
            supabaseClient
                .from(TABLES.CONNECTORS)
                .select(CONNECTOR_WITH_TAG_QUERY),
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
        ),
        'connector_tags'
    ).returns<ConnectorWithTagDetailQuery[]>();
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

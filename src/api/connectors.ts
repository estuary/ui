import type {
    ConnectorsQuery_DetailsForm,
    ConnectorWithTagQuery,
} from 'src/api/types';
import type { SortDirection } from 'src/types';

import {
    CONNECTOR_DETAILS,
    CONNECTOR_NAME,
    CONNECTOR_RECOMMENDED,
    CONNECTOR_WITH_TAG_QUERY,
} from 'src/api/shared';
import { supabaseClient } from 'src/context/GlobalProviders';
import {
    defaultTableFilter,
    handleFailure,
    handleSuccess,
    supabaseRetry,
    TABLES,
} from 'src/services/supabase';
import { requiredConnectorColumnsExist } from 'src/utils/connector-utils';

// Table-specific queries
const getConnectors = (
    searchQuery: any,
    sortDirection: SortDirection,
    protocol: string | null
) => {
    // TODO (V2 typing) - need a way to handle single vs multiple responses
    return requiredConnectorColumnsExist<ConnectorWithTagQuery[]>(
        defaultTableFilter<ConnectorWithTagQuery>(
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
    );
};

// Hydration-specific queries
const DETAILS_FORM_QUERY = `
    id,
    image_name,
    image:logo_url->>en-US::text,
    connector_tags !inner(
        id,
        connector_id,
        image_tag
    )
`;

// TODO: Remove getConnectors_detailsForm and related assets.
//   It is only used by the test JSON forms page.
const getConnectors_detailsFormTestPage = async (connectorId: string) => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.CONNECTORS)
                .select(DETAILS_FORM_QUERY)
                .eq('id', connectorId)
                .eq('connector_tags.connector_id', connectorId),
        'getConnectors_detailsFormTestPage'
    ).then(handleSuccess<ConnectorsQuery_DetailsForm[]>, handleFailure);

    return data;
};

const getSingleConnectorWithTag = async (connectorId: string) => {
    const data = await supabaseRetry(
        () =>
            requiredConnectorColumnsExist<ConnectorWithTagQuery[]>(
                supabaseClient
                    .from(TABLES.CONNECTORS)
                    .select(CONNECTOR_WITH_TAG_QUERY)
                    .eq('id', connectorId),
                'connector_tags'
            ),
        'getSingleConnectorWithTag'
    ).then(handleSuccess<ConnectorWithTagQuery[]>, handleFailure);

    return data;
};

export {
    getConnectors,
    getConnectors_detailsFormTestPage,
    getSingleConnectorWithTag,
};

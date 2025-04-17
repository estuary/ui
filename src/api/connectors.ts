import type {
    EntityWithCreateWorkflow,
    Schema,
    SortDirection,
} from 'src/types';

import { CONNECTOR_WITH_TAG_QUERY } from 'src/api/shared';
import { supabaseClient } from 'src/context/GlobalProviders';
import {
    CONNECTOR_DETAILS,
    CONNECTOR_NAME,
    CONNECTOR_RECOMMENDED,
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
    return requiredConnectorColumnsExist<ConnectorWithTagQuery>(
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
    ).returns<ConnectorWithTagQuery[]>();
};

// Hydration-specific queries
export interface BaseConnectorTag {
    id: string;
    connector_id: string;
    image_tag: string;
}

export interface ConnectorsQuery_DetailsForm {
    id: string;
    image_name: string;
    image: string;
    connector_tags: BaseConnectorTag[];
}

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

export interface ConnectorTag extends BaseConnectorTag {
    documentation_url: string;
    endpoint_spec_schema: Schema;
    image_name: string;
    protocol: EntityWithCreateWorkflow;
    title: string;
}

export interface ConnectorWithTagQuery {
    connector_tags: ConnectorTag[];
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

const getSingleConnectorWithTag = async (connectorId: string) => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.CONNECTORS)
                .select(CONNECTOR_WITH_TAG_QUERY)
                .eq('id', connectorId),
        'getSingleConnectorWithTag'
    ).then(handleSuccess<ConnectorWithTagQuery[]>, handleFailure);

    return data;
};

export { getConnectors, getConnectors_detailsForm, getSingleConnectorWithTag };

import { supabaseClient } from 'context/Supabase';
import { ConnectorTag, CONNECTOR_TAG_QUERY } from 'hooks/connectors/shared';
import {
    handleFailure,
    handleSuccess,
    supabaseRetry,
    TABLES,
} from 'services/supabase';
import { requiredConnectorColumnsExist } from 'utils/connector-utils';

const getConnectorTagDetails = async (connectorImage: string) => {
    const data = await supabaseRetry(
        () =>
            requiredConnectorColumnsExist<ConnectorTag>(
                supabaseClient
                    .from(TABLES.CONNECTOR_TAGS)
                    .select(CONNECTOR_TAG_QUERY)
                    .or(
                        `id.eq.${connectorImage},connector_id.eq.${connectorImage}`
                    )
                    .single()
            ),
        'getConnectors_detailsForm'
    ).then(handleSuccess<ConnectorTag>, handleFailure);

    return data;
};

export { getConnectorTagDetails };

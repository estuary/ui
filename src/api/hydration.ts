import { ConnectorTag } from 'hooks/connectors/shared';
import {
    LiveSpecsExtQuery,
    LiveSpecsExt_MaterializeCapture,
} from 'hooks/useLiveSpecsExt';
import {
    handleFailure,
    handleSuccess,
    supabaseClient,
    supabaseRetry,
    TABLES,
} from 'services/supabase';
import { Entity } from 'types';

// TODO (optimization): Consider removing he tight coupling between this file and the stores.
//  These APIs are truly general purpose. Perhaps break them out by supabase table.
type ConnectorTagResourceData = Pick<
    ConnectorTag,
    'connector_id' | 'resource_spec_schema'
>;

type ConnectorTagEndpointData = Pick<
    ConnectorTag,
    'connector_id' | 'endpoint_spec_schema'
>;

export const getSchema_Endpoint = async (connectorId: string | null) => {
    const endpointSchema = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.CONNECTOR_TAGS)
                .select(`connector_id,endpoint_spec_schema`)
                .eq('connector_id', connectorId)
                .not('endpoint_spec_schema', 'is', null),
        'getSchema_Endpoint'
    ).then(handleSuccess<ConnectorTagEndpointData[]>, handleFailure);

    return endpointSchema;
};

export const getSchema_Resource = async (
    connectorId: string,
    connectorTagId: string
) => {
    const resourceSchema = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.CONNECTOR_TAGS)
                .select(`connector_id,resource_spec_schema`)
                .eq('connector_id', connectorId)
                .eq('id', connectorTagId)
                .not('resource_spec_schema', 'is', null),
        'getSchema_Resource'
    ).then(handleSuccess<ConnectorTagResourceData[]>, handleFailure);

    return resourceSchema;
};

const liveSpecColumns = `id,spec_type,spec,writes_to,reads_from,last_pub_id,updated_at`;

export const getLiveSpecsByLiveSpecId = async (
    liveSpecId: string | string[],
    specType: Entity
) => {
    const draftArray: string[] =
        typeof liveSpecId === 'string' ? [liveSpecId] : liveSpecId;

    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.LIVE_SPECS_EXT)
                .select(liveSpecColumns)
                .eq('spec_type', specType)
                .or(`id.in.(${draftArray})`)
                .order('updated_at', { ascending: false }),
        'getLiveSpecsByLiveSpecId'
    ).then(handleSuccess<LiveSpecsExtQuery[]>, handleFailure);

    return data;
};

export const getLiveSpecsById_writesTo = async (
    liveSpecId: string | string[]
) => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.LIVE_SPECS_EXT)
                .select(`catalog_name,writes_to,spec_type`)
                .in(
                    'id',
                    typeof liveSpecId === 'string' ? [liveSpecId] : liveSpecId
                ),
        'getLiveSpecsById_writesTo'
    ).then(handleSuccess<LiveSpecsExt_MaterializeCapture>, handleFailure);

    return data;
};

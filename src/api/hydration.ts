import { ConnectorTag } from 'hooks/useConnectorTag';
import { LiveSpecsExtQuery } from 'hooks/useLiveSpecsExt';
import {
    handleFailure,
    handleSuccess,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import { Entity } from 'types';

// TODO (naming): Consider removing he tight coupling between this file and the stores.
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
    const endpointSchema = await supabaseClient
        .from(TABLES.CONNECTOR_TAGS)
        .select(`connector_id,endpoint_spec_schema`)
        .eq('connector_id', connectorId)
        .then(handleSuccess<ConnectorTagEndpointData[]>, handleFailure);

    return endpointSchema;
};

export const getSchema_Resource = async (connectorId: string | null) => {
    const resourceSchema = await supabaseClient
        .from(TABLES.CONNECTOR_TAGS)
        .select(`connector_id,resource_spec_schema`)
        .eq('connector_id', connectorId)
        .then(handleSuccess<ConnectorTagResourceData[]>, handleFailure);

    return resourceSchema;
};

const liveSpecColumns = `id,spec_type,spec,writes_to,reads_from,last_pub_id`;

export const getLiveSpecsByLiveSpecId = async (
    liveSpecId: string,
    specType: Entity
) => {
    const draftArray: string[] =
        typeof liveSpecId === 'string' ? [liveSpecId] : liveSpecId;

    const data = await supabaseClient
        .from(TABLES.LIVE_SPECS_EXT)
        .select(liveSpecColumns)
        .eq('spec_type', specType)
        .or(`id.in.(${draftArray})`)
        .then(handleSuccess<LiveSpecsExtQuery[]>, handleFailure);

    return data;
};

export const getLiveSpecsByLastPubId = async (
    lastPubId: string,
    specType: Entity
) => {
    const draftArray: string[] =
        typeof lastPubId === 'string' ? [lastPubId] : lastPubId;

    const data = await supabaseClient
        .from(TABLES.LIVE_SPECS_EXT)
        .select(liveSpecColumns)
        .eq('spec_type', specType)
        .or(`last_pub_id.in.(${draftArray})`)
        .then(handleSuccess<LiveSpecsExtQuery[]>, handleFailure);

    return data;
};

import { ConnectorTag } from 'hooks/useConnectorTag';
import { LiveSpecsExtQuery } from 'hooks/useLiveSpecsExt';
import {
    handleFailure,
    handleSuccess,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import { ENTITY } from 'types';

type ConnectorTagData = Pick<
    ConnectorTag,
    'connector_id' | 'resource_spec_schema'
>;

export const getResourceSchema = async (connectorId: string | null) => {
    const resourceSchema = await supabaseClient
        .from(TABLES.CONNECTOR_TAGS)
        .select(`connector_id,resource_spec_schema`)
        .eq('connector_id', connectorId)
        .then(handleSuccess<ConnectorTagData[]>, handleFailure);

    return resourceSchema;
};

const liveSpecColumns = `id,spec_type,spec,writes_to,reads_from`;

export const getLiveSpecsByLiveSpecId = async (
    liveSpecId: string,
    specType: ENTITY
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
    specType: ENTITY
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

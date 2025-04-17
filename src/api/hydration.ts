import type {
    LiveSpecsExt_MaterializeOrTransform,
    LiveSpecsExtQuery,
} from 'src/hooks/useLiveSpecsExt';
import type { Entity, Schema } from 'src/types';

import { supabaseClient } from 'src/context/GlobalProviders';
import {
    handleFailure,
    handleSuccess,
    supabaseRetry,
    TABLES,
} from 'src/services/supabase';

interface ConnectorTag {
    connectors: {
        image_name: string;
    };
    disable_backfill: boolean;
    id: string;
    connector_id: string;
    default_capture_interval: string | null;
    image_tag: string;
    endpoint_spec_schema: Schema;
    resource_spec_schema: Schema;
    documentation_url: string;
}

// TODO (optimization): Consider removing the tight coupling between this file and the stores.
//  These APIs are truly general purpose. Perhaps break them out by supabase table.
type ConnectorTagResourceData = Pick<
    ConnectorTag,
    | 'connector_id'
    | 'default_capture_interval'
    | 'disable_backfill'
    | 'resource_spec_schema'
>;

export const getSchema_Resource = async (connectorTagId: string | null) => {
    const resourceSchema = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.CONNECTOR_TAGS)
                .select(
                    `default_capture_interval,disable_backfill,resource_spec_schema`
                )
                .eq('id', connectorTagId)
                .single(),
        'getSchema_Resource'
    ).then(handleSuccess<ConnectorTagResourceData>, handleFailure);

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
    ).then(handleSuccess<LiveSpecsExt_MaterializeOrTransform[]>, handleFailure);

    return data;
};

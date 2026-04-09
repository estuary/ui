// TODO (Typing)
// Since the typing looks at columns it was a pain to make this
//  truly reusable. So marking the query as `any` even thogh
//  it is PostgrestFilterBuilder<ConnectorTag |ConnectorWithTagDetailQuery>

import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import type { ConnectorConfig } from 'deps/flow/flow';
import type { DraftSpecsExtQuery_ByDraftId } from 'src/api/draftSpecs';
import type { ConnectorTagData } from 'src/context/ConnectorTag';
import type { LiveSpecsExtQuery } from 'src/hooks/useLiveSpecsExt';
import type {
    DekafConnectorMetadata,
    StandardConnectorMetadata,
} from 'src/stores/DetailsForm/types';
import type { DekafConfig } from 'src/types';

export const DEKAF_IMAGE_PREFIX = 'ghcr.io/estuary/dekaf-';
const DEKAF_VARIANT_PROPERTY = 'variant';

export const isDekafConnector = (
    value: StandardConnectorMetadata | DekafConnectorMetadata
): value is DekafConnectorMetadata => DEKAF_VARIANT_PROPERTY in value;

export const isDekafEndpointConfig = (
    value: ConnectorConfig | DekafConfig
): value is DekafConfig => DEKAF_VARIANT_PROPERTY in value;

export const getEndpointConfig = (
    data: DraftSpecsExtQuery_ByDraftId[] | LiveSpecsExtQuery[]
) =>
    Boolean(data[0].spec.endpoint?.dekaf)
        ? data[0].spec.endpoint.dekaf.config
        : data[0].spec.endpoint.connector.config;

// TODO (V2 typing) - query should take in filter builder better
export const requiredConnectorColumnsExist = <Response>(
    query: PostgrestFilterBuilder<any, any, any, any, any>,
    columnPrefix?: string
): PostgrestFilterBuilder<any, any, Response, any, any> => {
    return query
        .not(`${columnPrefix ? `${columnPrefix}.` : ''}image_tag`, 'is', null)
        .not(
            `${columnPrefix ? `${columnPrefix}.` : ''}resource_spec_schema`,
            'is',
            null
        )
        .not(
            `${columnPrefix ? `${columnPrefix}.` : ''}endpoint_spec_schema`,
            'is',
            null
        );
};

export const buildConnectorImageFromTag = (
    connectorTag: ConnectorTagData
): StandardConnectorMetadata | DekafConnectorMetadata => {
    const { id, connectorId, imageTag, connector } = connectorTag;

    const base = {
        connectorId,
        iconPath: connector.logoUrl ?? '',
        id,
        imageName: connector.imageName,
        imageTag,
    };

    return connector.imageName.startsWith(DEKAF_IMAGE_PREFIX)
        ? { ...base, variant: connector.imageName.substring(DEKAF_IMAGE_PREFIX.length) }
        : { ...base, imagePath: `${connector.imageName}${imageTag}` };
};

// TODO (GQL:live specs) - once we get live specs fetched with GQL we don't need to worry about this
export function formatOldUuidToGql(id: string): string;
export function formatOldUuidToGql(id: null | undefined): null | undefined;
export function formatOldUuidToGql(
    id: string | null | undefined
): string | null | undefined;
export function formatOldUuidToGql(id: string | null | undefined) {
    return typeof id === 'string' ? id.replaceAll(':', '') : id;
}

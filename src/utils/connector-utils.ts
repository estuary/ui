// TODO (Typing)
// Since the typing looks at columns it was a pain to make this
//  truly reusable. So marking the query as `any` even thogh
//  it is PostgrestFilterBuilder<ConnectorTag |ConnectorWithTagDetailQuery>

import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import type { ConnectorConfig } from 'deps/flow/flow';
import type { DraftSpecsExtQuery_ByDraftId } from 'src/api/draftSpecs';
import type {
    ConnectorsQuery_DetailsForm,
    ConnectorWithTagQuery,
} from 'src/api/types';
import type { LiveSpecsExtQuery } from 'src/hooks/useLiveSpecsExt';
import type {
    ConnectorMetadata,
    DekafConnectorMetadata,
    Details,
    StandardConnectorMetadata,
} from 'src/stores/DetailsForm/types';
import type { DekafConfig } from 'src/types';

const DEKAF_IMAGE_PREFIX = 'ghcr.io/estuary/dekaf-';
const DEKAF_VARIANT_PROPERTY = 'variant';

export const isDekafConnector = (
    value: StandardConnectorMetadata | DekafConnectorMetadata
): value is DekafConnectorMetadata => DEKAF_VARIANT_PROPERTY in value;

export const isDekafEndpointConfig = (
    value: ConnectorConfig | DekafConfig
): value is DekafConfig => DEKAF_VARIANT_PROPERTY in value;

export interface ConnectorVersionEvaluationOptions {
    connectorId: string;
    existingImageTag: string;
}

// TODO (typing): Align `connectors` and `connector_tags` query interfaces.
//   Renamed table columns need to be given the same name to avoid type conflicts.
export function getConnectorMetadata(
    connector: ConnectorsQuery_DetailsForm | ConnectorWithTagQuery,
    options?: ConnectorVersionEvaluationOptions
): Details['data']['connectorImage'] {
    const connectorMetadata: ConnectorMetadata = {
        iconPath: connector.image,
        imageName: connector.image_name,
        imageTag: connector.connector_tags[0].image_tag,
    };

    return connectorMetadata.imageName.startsWith(DEKAF_IMAGE_PREFIX)
        ? {
              ...connectorMetadata,
              variant: connectorMetadata.imageName.substring(
                  DEKAF_IMAGE_PREFIX.length
              ),
          }
        : {
              ...connectorMetadata,
              imagePath: `${connectorMetadata.imageName}${connectorMetadata.imageTag}`,
          };
}

export const getEndpointConfig = (
    data: DraftSpecsExtQuery_ByDraftId[] | LiveSpecsExtQuery[]
) =>
    Boolean(data[0].spec.endpoint?.dekaf)
        ? data[0].spec.endpoint.dekaf.config
        : data[0].spec.endpoint.connector.config;

// TODO (V2 typing) - query should take in filter builder better
// This is being check in backend but different context

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

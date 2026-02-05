// TODO (Typing)
// Since the typing looks at columns it was a pain to make this
//  truly reusable. So marking the query as `any` even thogh
//  it is PostgrestFilterBuilder<ConnectorTag |ConnectorWithTagDetailQuery>

import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import type { ConnectorConfig } from 'deps/flow/flow';
import type { DraftSpecsExtQuery_ByDraftId } from 'src/api/draftSpecs';
import type {
    BaseConnectorTag,
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
import type { DekafConfig, ManualTypedPostgrestResponse } from 'src/types';

import { hasLength } from 'src/utils/misc-utils';

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

export function evaluateConnectorVersions(
    connector: ConnectorWithTagQuery | ConnectorsQuery_DetailsForm,
    options?: ConnectorVersionEvaluationOptions
): BaseConnectorTag {
    // Return the version of the connector that is used by the existing task in an edit workflow.
    if (options && options.connectorId === connector.id) {
        const connectorsInUse = connector.connector_tags.filter(
            (version) => version.image_tag === options.existingImageTag
        );

        if (hasLength(connectorsInUse)) {
            return connectorsInUse[0];
        }
    }

    // Return the latest version of a given connector.
    const { connector_id, id, image_tag } = connector.connector_tags.sort(
        (a, b) => b.image_tag.localeCompare(a.image_tag)
    )[0];

    return { connector_id, id, image_tag };
}

// TODO (typing): Align `connectors` and `connector_tags` query interfaces.
//   Renamed table columns need to be given the same name to avoid type conflicts.
export function getConnectorMetadata(
    connector: ConnectorsQuery_DetailsForm | ConnectorWithTagQuery,
    options?: ConnectorVersionEvaluationOptions
): Details['data']['connectorImage'] {
    const { id: connectorTagId, image_tag } = evaluateConnectorVersions(
        connector,
        options
    );

    const { id: connectorId, image: iconPath, image_name } = connector;

    const connectorMetadata: ConnectorMetadata = {
        connectorId,
        iconPath,
        id: connectorTagId,
        imageName: image_name,
        imageTag: image_tag,
    };

    return image_name.startsWith(DEKAF_IMAGE_PREFIX)
        ? {
              ...connectorMetadata,
              variant: image_name.substring(DEKAF_IMAGE_PREFIX.length),
          }
        : {
              ...connectorMetadata,
              imagePath: `${image_name}${image_tag}`,
          };
}

export const getEndpointConfig = (
    data: DraftSpecsExtQuery_ByDraftId[] | LiveSpecsExtQuery[]
) =>
    Boolean(data[0].spec.endpoint?.dekaf)
        ? data[0].spec.endpoint.dekaf.config
        : data[0].spec.endpoint.connector.config;

// TODO (V2 typing) - query should take in filter builder better
export const requiredConnectorColumnsExist = <
    Response extends ManualTypedPostgrestResponse,
>(
    query: PostgrestFilterBuilder<any, any, any, any, any, any, any>,
    columnPrefix?: string
): PostgrestFilterBuilder<any, any, Response, any, any, any, any> => {
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

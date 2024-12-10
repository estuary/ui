// TODO (Typing)
// Since the typing looks at columns it was a pain to make this
//  truly reusable. So marking the query as `any` even thogh
//  it is PostgrestFilterBuilder<ConnectorTag |ConnectorWithTagDetailQuery>

import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { ConnectorsQuery_DetailsForm } from 'api/connectors';
import { DraftSpecsExtQuery_ByDraftId } from 'api/draftSpecs';
import { ConnectorWithTagDetailQuery } from 'hooks/connectors/shared';
import { LiveSpecsExtQuery } from 'hooks/useLiveSpecsExt';
import {
    ConnectorMetadata,
    DekafConnectorMetadata,
    Details,
    StandardConnectorMetadata,
} from 'stores/DetailsForm/types';
import { DekafConfig } from 'types';
import { ConnectorConfig } from '../../deps/flow/flow';
import {
    ConnectorVersionEvaluationOptions,
    evaluateConnectorVersions,
} from './workflow-utils';

const DEKAF_IMAGE_PREFIX = 'ghcr.io/estuary/dekaf-';
const DEKAF_VARIANT_PROPERTY = 'variant';

export const isDekafConnector = (
    value: StandardConnectorMetadata | DekafConnectorMetadata
): value is DekafConnectorMetadata => DEKAF_VARIANT_PROPERTY in value;

export const isDekafEndpointConfig = (
    value: ConnectorConfig | DekafConfig
): value is DekafConfig => DEKAF_VARIANT_PROPERTY in value;

// TODO (typing): Align `connectors` and `connector_tags` query interfaces.
//   Renamed table columns need to be given the same name to avoid type conflicts.
export function getConnectorMetadata(
    connector: ConnectorsQuery_DetailsForm | ConnectorWithTagDetailQuery,
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
export const requiredConnectorColumnsExist = <Response>(
    query: any,
    columnPrefix?: string
): PostgrestFilterBuilder<any, any, Response> => {
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

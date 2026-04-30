import type { ConnectorConfig } from 'deps/flow/flow';
import type { DraftSpecsExtQuery_ByDraftId } from 'src/api/draftSpecs';
import type { ConnectorTagData } from 'src/context/ConnectorTag';
import type { LiveSpecsExtQuery } from 'src/hooks/useLiveSpecsExt';
import type {
    DekafConnectorMetadata,
    StandardConnectorMetadata,
} from 'src/stores/DetailsForm/types';
import type { DekafConfig } from 'src/types';

import { FULL_IMAGE_NAME_RE } from 'src/validation';

export const DEKAF_IMAGE_PREFIX = 'ghcr.io/estuary/dekaf-';

export const buildConnectorImagePath = (
    imageName: string,
    imageTag: string
): string => `${imageName}${imageTag}`;

export const parseConnectorImagePath = (
    imagePath: string
): { imageName: string; imageTag: string } | null => {
    if (!FULL_IMAGE_NAME_RE.test(imagePath)) return null;
    const lastColon = imagePath.lastIndexOf(':');
    return {
        imageName: imagePath.substring(0, lastColon),
        imageTag: imagePath.substring(lastColon),
    };
};

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

export const buildConnectorImageFromTag = (
    connectorTag: ConnectorTagData
): StandardConnectorMetadata | DekafConnectorMetadata => {
    const { id, imageTag, connector } = connectorTag;

    const base = {
        connectorId: connector.id,
        iconPath: connector.logoUrl ?? '',
        id,
        imageName: connector.imageName,
        imageTag,
    };

    return connector.imageName.startsWith(DEKAF_IMAGE_PREFIX)
        ? {
              ...base,
              variant: connector.imageName.substring(DEKAF_IMAGE_PREFIX.length),
          }
        : {
              ...base,
              imagePath: buildConnectorImagePath(connector.imageName, imageTag),
          };
};

import type { ConnectorConfig } from 'deps/flow/flow';
import type { DekafConfig } from 'src/types';

import { useShallow } from 'zustand/react/shallow';

import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { isDekafConnector } from 'src/utils/connector-utils';

// Selector hooks
export const useDetailsForm_changed_connectorId = () => {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    return useDetailsFormStore(
        (state) =>
            state.details.data.connectorImage.connectorId !==
                state.previousDetails.data.connectorImage.connectorId ||
            Boolean(
                connectorId &&
                    connectorId !==
                        state.details.data.connectorImage.connectorId
            )
    );
};

const EMPTY_CONFIG = {};
export const useDetailsForm_endpointConfig = ():
    | ConnectorConfig
    | DekafConfig => {
    const endpointConfig_dekaf: DekafConfig = useDetailsFormStore(
        useShallow((state) => ({
            config: EMPTY_CONFIG,
            // @ts-expect-error we only use this after checking for dekaf down below
            variant: state.details.data.connectorImage.variant,
        }))
    );

    const endpointConfig_default: ConnectorConfig = useDetailsFormStore(
        useShallow((state) => ({
            config: EMPTY_CONFIG,
            // @ts-expect-error we only use this after checking for dekaf down below
            image: state.details.data.connectorImage.imagePath,
        }))
    );

    return useDetailsFormStore((state) => {
        return isDekafConnector(state.details.data.connectorImage)
            ? endpointConfig_dekaf
            : endpointConfig_default;
    });
};

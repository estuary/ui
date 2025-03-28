import { useDetailsFormStore } from './Store';

import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

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

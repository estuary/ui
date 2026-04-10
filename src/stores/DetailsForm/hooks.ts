import { useConnectorTag } from 'src/context/ConnectorTag';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';

export const useDetailsForm_changed_connectorId = (): boolean => {
    const { connectorId: currentConnectorId } = useConnectorTag();

    const previousConnectorId = useDetailsFormStore(
        (state) => state.previousConnectorId
    );

    const urlConnectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    return (
        currentConnectorId !== previousConnectorId ||
        currentConnectorId !== urlConnectorId
    );
};

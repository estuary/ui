import SectionError from 'components/shared/Entity/ValidationErrorSummary/SectionError';
import { EndpointConfigStoreNames, useZustandStore } from 'context/Zustand';
import { EndpointConfigState } from 'stores/EndpointConfig';

interface Props {
    endpointConfigStoreName: EndpointConfigStoreNames;
}

function EndpointConfigErrors({ endpointConfigStoreName }: Props) {
    const endpointErrors = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointConfigErrors']
    >(endpointConfigStoreName, (state) => state.endpointConfigErrors);

    const endpointSchema = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointConfig']['data']
    >(endpointConfigStoreName, (state) => state.endpointConfig.data);

    return (
        <SectionError
            errors={endpointErrors}
            config={endpointSchema}
            configEmptyMessage="entityCreate.endpointConfig.endpointConfigMissing"
            title="entityCreate.endpointConfig.endpointConfigHaveErrors"
        />
    );
}

export default EndpointConfigErrors;

import SectionError from 'components/shared/Entity/ValidationErrorSummary/SectionError';
import {
    useEndpointConfigStore_endpointSchema,
    useEndpointConfigStore_errorsExist,
} from 'stores/EndpointConfig';

function EndpointConfigErrors() {
    const endpointErrors = useEndpointConfigStore_errorsExist();
    const endpointSchema = useEndpointConfigStore_endpointSchema();

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

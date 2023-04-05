import SectionError from 'components/shared/Entity/ValidationErrorSummary/SectionError';
import {
    useEndpointConfigStore_changed,
    useEndpointConfigStore_endpointConfigErrors,
    useEndpointConfigStore_endpointCustomErrors,
    useEndpointConfigStore_endpointSchema,
} from 'stores/EndpointConfig/hooks';

function EndpointConfigErrors() {
    const endpointConfigChanged = useEndpointConfigStore_changed();

    const endpointCustomErrors = useEndpointConfigStore_endpointCustomErrors();
    const endpointErrors = useEndpointConfigStore_endpointConfigErrors();
    const endpointSchema = useEndpointConfigStore_endpointSchema();

    const allErrors = endpointConfigChanged()
        ? endpointCustomErrors.concat(endpointErrors)
        : endpointErrors;

    return (
        <SectionError
            errors={allErrors}
            config={endpointSchema}
            configEmptyMessage="workflows.error.endpointConfig.empty"
            title="entityCreate.endpointConfig.endpointConfigHaveErrors"
        />
    );
}

export default EndpointConfigErrors;

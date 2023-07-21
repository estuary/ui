import SectionError from 'components/shared/Entity/ValidationErrorSummary/SectionError';

import { useEntityWorkflow_Editing } from 'context/Workflow';

import {
    useEndpointConfig_serverUpdateRequired,
    useEndpointConfigStore_customErrors,
    useEndpointConfigStore_endpointConfigErrors,
    useEndpointConfigStore_endpointSchema,
} from 'stores/EndpointConfig/hooks';

import { hasLength } from 'utils/misc-utils';

function EndpointConfigErrors() {
    const isEdit = useEntityWorkflow_Editing();
    const serverUpdateRequired = useEndpointConfig_serverUpdateRequired();

    const endpointCustomErrors = useEndpointConfigStore_customErrors();
    const endpointErrors = useEndpointConfigStore_endpointConfigErrors();
    const endpointSchema = useEndpointConfigStore_endpointSchema();

    // When editing we only care about errors if there is a server update needed
    //  otherwise we can ignore. This is needed because Endpoing Config can
    //  contains SOPS encrypted values that during edit are "blank" and throww
    //  validation errors. This is especially true for OAuth
    if (isEdit && !serverUpdateRequired) {
        return null;
    } else {
        const errors = hasLength(endpointCustomErrors)
            ? endpointCustomErrors
            : endpointErrors;
        return (
            <SectionError
                errors={errors}
                config={endpointSchema}
                configEmptyMessage="workflows.error.endpointConfig.empty"
                title="entityCreate.endpointConfig.endpointConfigHaveErrors"
            />
        );
    }
}

export default EndpointConfigErrors;

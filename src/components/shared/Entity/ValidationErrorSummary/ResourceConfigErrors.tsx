import SectionError from 'components/shared/Entity/ValidationErrorSummary/SectionError';

import {
    useResourceConfig_collections,
    useResourceConfig_resourceConfigErrors,
} from 'stores/ResourceConfig/hooks';

function ResourceConfigErrors() {
    const collections = useResourceConfig_collections();

    const filteredResourceConfigErrors =
        useResourceConfig_resourceConfigErrors();

    return (
        <SectionError
            errors={filteredResourceConfigErrors}
            errorMessage="entityCreate.endpointConfig.resourceConfigInvalid"
            config={collections}
            configEmptyMessage="entityCreate.endpointConfig.collectionsMissing"
            title="entityCreate.endpointConfig.resourceConfigHaveErrors"
        />
    );
}

export default ResourceConfigErrors;

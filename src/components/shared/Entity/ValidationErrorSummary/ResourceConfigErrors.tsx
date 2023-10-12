import SectionError from 'components/shared/Entity/ValidationErrorSummary/SectionError';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
    useResourceConfig_collections,
    useResourceConfig_resourceConfigErrors,
} from 'stores/ResourceConfig/hooks';
import { hasLength } from 'utils/misc-utils';

function ResourceConfigErrors() {
    const intl = useIntl();
    const collections = useResourceConfig_collections();

    const filteredResourceConfigErrors =
        useResourceConfig_resourceConfigErrors();

    const errorMessages = useMemo(() => {
        const response = [];

        if (hasLength(filteredResourceConfigErrors)) {
            response.push({
                message: intl.formatMessage({
                    id: 'entityCreate.endpointConfig.resourceConfigInvalid',
                }),
            });
        }

        return response;
    }, [filteredResourceConfigErrors, intl]);

    console.log('errorMessages', errorMessages);

    return (
        <SectionError
            errors={errorMessages}
            config={collections}
            configEmptyMessage="entityCreate.endpointConfig.collectionsMissing"
            title="entityCreate.endpointConfig.resourceConfigHaveErrors"
        />
    );
}

export default ResourceConfigErrors;

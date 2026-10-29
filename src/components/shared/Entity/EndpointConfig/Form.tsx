import { useMemo } from 'react';

import { Box } from '@mui/material';

import { JsonForms } from '@jsonforms/react';

import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { useEntityType } from 'src/context/EntityContext';
import { jsonFormsPadding } from 'src/context/Theme';
import {
    SecretField,
    secretFieldTester,
} from 'src/forms/renderers/secrets/SecretField';
import { custom_generateDefaultUISchema } from 'src/services/jsonforms';
import { jsonFormsDefaults } from 'src/services/jsonforms/defaults';
import {
    useEndpointConfig_endpointCanBeEmpty,
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_endpointSchema,
    useEndpointConfigStore_setEndpointConfig,
} from 'src/stores/EndpointConfig/hooks';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { useSecretsStore_usesSecrets } from 'src/stores/Secrets/hooks';
import { prepareSecretsSchema } from 'src/utils/secrets-utils';

const CONFIG_EDITOR_ID = 'endpointConfigEditor';

const secretsRenderers = [
    ...jsonFormsDefaults.renderers,
    { renderer: SecretField, tester: secretFieldTester },
];

interface Props {
    readOnly: boolean;
}

function EndpointConfigForm({ readOnly }: Props) {
    const entityType = useEntityType();

    // Endpoint Config Store
    const endpointConfig = useEndpointConfigStore_endpointConfig_data();
    const setEndpointConfig = useEndpointConfigStore_setEndpointConfig();
    const endpointSchema = useEndpointConfigStore_endpointSchema();
    const endpointCanBeEmpty = useEndpointConfig_endpointCanBeEmpty();
    const usesSecrets = useSecretsStore_usesSecrets();

    // render secret fields only if the schema uses secrets
    const renderers = usesSecrets
        ? secretsRenderers
        : jsonFormsDefaults.renderers;

    // Form State Store
    const isActive = useFormStateStore_isActive();

    // Secret values live in secrets, not the config, so secret fields can't be
    // required by the form's schema. The Secrets store checks them instead.
    const formSchema = useMemo(
        () =>
            usesSecrets && !isEmpty(endpointSchema)
                ? prepareSecretsSchema(endpointSchema)
                : endpointSchema,
        [endpointSchema, usesSecrets]
    );

    const categoryLikeSchema = useMemo(() => {
        if (!isEmpty(formSchema)) {
            return custom_generateDefaultUISchema(formSchema);
        } else {
            return null;
        }
    }, [formSchema]);

    if (categoryLikeSchema === null) {
        return null;
    }

    return (
        <Box id={CONFIG_EDITOR_ID} sx={jsonFormsPadding}>
            <JsonForms
                {...jsonFormsDefaults}
                schema={formSchema}
                renderers={renderers}
                uischema={categoryLikeSchema}
                data={endpointConfig}
                readonly={readOnly || isActive}
                validationMode="ValidateAndShow"
                onChange={setEndpointConfig}
            />
            {endpointCanBeEmpty ? (
                <AlertBox short severity="info">
                    <FormattedMessage
                        id="entityCreate.endpointConfig.configCanBeBlank.message"
                        values={{
                            entityType,
                        }}
                    />
                </AlertBox>
            ) : null}
        </Box>
    );
}

export default EndpointConfigForm;

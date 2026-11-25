import { useMemo } from 'react';

import { Box } from '@mui/material';

import { JsonForms } from '@jsonforms/react';

import { isEmpty } from 'lodash';

import AlertBox from 'src/components/shared/AlertBox';
import { useSecretStorage } from 'src/components/shared/Entity/hooks/useSecretStorage';
import { useEntityType } from 'src/context/EntityContext';
import { jsonFormsPadding } from 'src/context/Theme';
import {
    SecretField,
    secretFieldTester,
} from 'src/forms/renderers/secrets/SecretField';
import { custom_generateDefaultUISchema } from 'src/services/jsonforms';
import { jsonFormsDefaults } from 'src/services/jsonforms/defaults';
import { defaultOptions } from 'src/services/jsonforms/shared';
import {
    useEndpointConfig_endpointCanBeEmpty,
    useEndpointConfigStore_activeSecretNames,
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_endpointSchema,
    useEndpointConfigStore_setEndpointConfig,
} from 'src/stores/EndpointConfig/hooks';
import { useEndpointConfigStore } from 'src/stores/EndpointConfig/Store';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { toJsonPointer } from 'src/utils/schema-utils';
import { toFormSchema } from 'src/utils/secrets-utils';

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
    const activeSecretNames = useEndpointConfigStore_activeSecretNames();

    // Secret fields are only set through a dialog when the task uses secrets
    const secretStorage = useSecretStorage();
    const renderers =
        secretStorage === 'secrets'
            ? secretsRenderers
            : jsonFormsDefaults.renderers;

    // A field with a stored secret isn't empty, though the data has nothing
    // there, so it isn't required
    const formSchema = useMemo(
        () =>
            secretStorage === 'secrets'
                ? toFormSchema(endpointSchema, Object.keys(activeSecretNames))
                : endpointSchema,
        [activeSecretNames, endpointSchema, secretStorage]
    );

    // The union callbacks read the store when they're called, rather than
    // capturing its values, so this config never changes. A new config makes
    // JSON Forms reload its data from props, which can drop an edit in progress.
    const config = useMemo(
        () => ({
            ...defaultOptions,
            unionOptions: {
                getSelectedOption: (path: string) =>
                    useEndpointConfigStore.getState().selectedOptions[
                        toJsonPointer(path)
                    ],
                switchOption: (
                    path: string,
                    option: number,
                    defaults: unknown,
                    fields: string[]
                ) =>
                    useEndpointConfigStore
                        .getState()
                        .switchOption(
                            toJsonPointer(path),
                            option,
                            defaults,
                            fields
                        ),
            },
        }),
        []
    );

    // Form State Store
    const isActive = useFormStateStore_isActive();

    const categoryLikeSchema = useMemo(() => {
        if (!isEmpty(endpointSchema)) {
            return custom_generateDefaultUISchema(endpointSchema);
        } else {
            return null;
        }
    }, [endpointSchema]);

    if (categoryLikeSchema === null) {
        return null;
    }

    return (
        <Box id={CONFIG_EDITOR_ID} sx={jsonFormsPadding}>
            <JsonForms
                {...jsonFormsDefaults}
                schema={formSchema}
                renderers={renderers}
                config={config}
                uischema={categoryLikeSchema}
                data={endpointConfig}
                readonly={readOnly || isActive}
                validationMode="ValidateAndShow"
                onChange={setEndpointConfig}
            />
            {endpointCanBeEmpty ? (
                <AlertBox short severity="info">
                    {`This ${entityType} requires no configuration.`}
                </AlertBox>
            ) : null}
        </Box>
    );
}

export default EndpointConfigForm;

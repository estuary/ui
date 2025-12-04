import { useMemo } from 'react';

import { Box, StyledEngineProvider } from '@mui/material';

import { JsonForms } from '@jsonforms/react';

import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { useEntityType } from 'src/context/EntityContext';
import { jsonFormsPadding } from 'src/context/Theme';
import { custom_generateDefaultUISchema } from 'src/services/jsonforms';
import { jsonFormsDefaults } from 'src/services/jsonforms/defaults';
import {
    useEndpointConfig_endpointCanBeEmpty,
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_endpointSchema,
    useEndpointConfigStore_setEndpointConfig,
} from 'src/stores/EndpointConfig/hooks';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

export const CONFIG_EDITOR_ID = 'endpointConfigEditor';

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
        <StyledEngineProvider injectFirst>
            <Box
                id={CONFIG_EDITOR_ID}
                sx={{
                    ...jsonFormsPadding,
                    // TODO (horizontal forms) : potential styling for making form horizontal
                    // '& .MuiAccordionDetails-root .MuiGrid-root.MuiGrid-item > .MuiFormControl-root':
                    //     {
                    //         background: 'red',
                    //         minWidth: 300,
                    //     },
                }}
            >
                <JsonForms
                    {...jsonFormsDefaults}
                    schema={endpointSchema}
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
        </StyledEngineProvider>
    );
}

export default EndpointConfigForm;

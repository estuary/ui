import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Box, StyledEngineProvider } from '@mui/material';
import AlertBox from 'src/components/shared/AlertBox';
import { useEntityType } from 'src/context/EntityContext';
import { jsonFormsPadding } from 'src/context/Theme';
import { isEmpty } from 'lodash';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { customAjv } from 'src/services/ajv';
import { custom_generateDefaultUISchema } from 'src/services/jsonforms';
import defaultRenderers from 'src/services/jsonforms/defaultRenderers';
import { defaultOptions } from 'src/services/jsonforms/shared';
import {
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_endpointSchema,
    useEndpointConfigStore_setEndpointConfig,
    useEndpointConfig_endpointCanBeEmpty,
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
                    schema={endpointSchema}
                    uischema={categoryLikeSchema}
                    data={endpointConfig}
                    renderers={defaultRenderers}
                    cells={materialCells}
                    config={defaultOptions}
                    readonly={readOnly || isActive}
                    validationMode="ValidateAndShow"
                    onChange={setEndpointConfig}
                    ajv={customAjv}
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

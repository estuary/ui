import type { Props } from 'src/components/shared/Entity/DetailsForm/types';

import { Box, Stack, Typography } from '@mui/material';

import { JsonForms } from '@jsonforms/react';

import { FormattedMessage, useIntl } from 'react-intl';

import { useEditorStore_isSaving } from 'src/components/editor/Store/hooks';
import AlertBox from 'src/components/shared/AlertBox';
import useFormFields from 'src/components/shared/Entity/DetailsForm/useFormFields';
import { CONNECTOR_IMAGE_SCOPE } from 'src/forms/renderers/Connectors';
import { jsonFormsDefaults } from 'src/services/jsonforms/defaults';
import { showValidation } from 'src/services/jsonforms/shared';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    useFormStateStore_displayValidation,
    useFormStateStore_isActive,
    useFormStateStore_messagePrefix,
} from 'src/stores/FormState/hooks';

export const CONFIG_EDITOR_ID = 'endpointConfigEditor';

function DetailsFormForm({ entityType, readOnly }: Props) {
    const intl = useIntl();

    // Details Form Store
    const formData = useDetailsFormStore((state) => state.details.data);

    // Draft Editor Store
    const isSaving = useEditorStore_isSaving();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();
    const displayValidation = useFormStateStore_displayValidation();

    const isActive = useFormStateStore_isActive();

    // TODO: Create a new component to render the form.
    const { schema, uiSchema, updateDetails } = useFormFields(entityType);

    return (
        <>
            {readOnly ? (
                <Box sx={{ mb: 2 }}>
                    <AlertBox
                        sx={{
                            maxWidth: 'fit-content',
                        }}
                        short
                        severity="info"
                    >
                        {intl.formatMessage({
                            id: 'entityEdit.alert.detailsFormDisabled',
                        })}
                    </AlertBox>
                </Box>
            ) : null}

            <Typography sx={{ mb: 2 }}>
                <FormattedMessage id={`${messagePrefix}.instructions`} />
            </Typography>

            <Stack direction="row" spacing={2}>
                {schema.properties[CONNECTOR_IMAGE_SCOPE].oneOf.length > 0 ? (
                    <JsonForms
                        {...jsonFormsDefaults}
                        schema={schema}
                        uischema={uiSchema}
                        data={formData}
                        readonly={readOnly ?? (isSaving || isActive)}
                        validationMode={showValidation(displayValidation)}
                        onChange={updateDetails}
                    />
                ) : (
                    <AlertBox severity="warning" short>
                        <FormattedMessage
                            id={`${messagePrefix}.missingConnectors`}
                        />
                    </AlertBox>
                )}
            </Stack>
        </>
    );
}

export default DetailsFormForm;

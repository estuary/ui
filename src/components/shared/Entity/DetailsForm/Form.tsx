import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Box, Stack, Typography } from '@mui/material';
import { useEditorStore_isSaving } from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import { Props } from 'components/shared/Entity/DetailsForm/types';
import { CONNECTOR_IMAGE_SCOPE } from 'forms/renderers/Connectors';
import { ConnectorWithTagDetailQuery } from 'hooks/connectors/shared';
import { FormattedMessage, useIntl } from 'react-intl';
import defaultRenderers from 'services/jsonforms/defaultRenderers';
import { defaultOptions, showValidation } from 'services/jsonforms/shared';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { Details } from 'stores/DetailsForm/types';
import {
    useFormStateStore_displayValidation,
    useFormStateStore_isActive,
    useFormStateStore_messagePrefix,
} from 'stores/FormState/hooks';
import { evaluateConnectorVersions } from 'utils/workflow-utils';
import useFormFields from './useFormFields';

export const CONFIG_EDITOR_ID = 'endpointConfigEditor';

export const getConnectorImageDetails = (
    connector: ConnectorWithTagDetailQuery,
    options?: { connectorId: string; existingImageTag: string }
): Details['data']['connectorImage'] => {
    const connectorTag = evaluateConnectorVersions(connector, options);

    return {
        connectorId: connector.id,
        id: connectorTag.id,
        imageName: connector.image_name,
        imagePath: `${connector.image_name}${connectorTag.image_tag}`,
        iconPath: connector.image,
    };
};

function DetailsFormForm({ connectorTags, entityType, readOnly }: Props) {
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
    const { schema, uiSchema, updateDetails } = useFormFields(
        connectorTags,
        entityType
    );

    return (
        <>
            {readOnly ? (
                <Box sx={{ mb: 2, maxWidth: 'fit-content' }}>
                    <AlertBox short severity="info">
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
                        schema={schema}
                        uischema={uiSchema}
                        data={formData}
                        renderers={defaultRenderers}
                        cells={materialCells}
                        config={defaultOptions}
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

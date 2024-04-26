import { JsonForms } from '@jsonforms/react';
import { Stack, StyledEngineProvider } from '@mui/material';
import useConfigurationSchema from 'components/admin/Settings/StorageMappings/Dialog/useConfigurationSchema';
import { useStorageMappingStore } from 'components/admin/Settings/StorageMappings/Store/create';
import { jsonFormsPadding } from 'context/Theme';
import { jsonFormsDefaults } from 'services/jsonforms/defaults';

function StorageMappingForm() {
    const formValue = useStorageMappingStore((state) => state.formValue);
    const updateFormValue = useStorageMappingStore(
        (state) => state.updateFormValue
    );

    const { schema, uischema } = useConfigurationSchema();

    return (
        <StyledEngineProvider injectFirst>
            <Stack sx={{ ...jsonFormsPadding }}>
                <JsonForms
                    {...jsonFormsDefaults}
                    schema={schema}
                    uischema={uischema}
                    data={formValue.data}
                    onChange={(value) => {
                        updateFormValue(value);
                    }}
                />
            </Stack>
        </StyledEngineProvider>
    );
}

export default StorageMappingForm;

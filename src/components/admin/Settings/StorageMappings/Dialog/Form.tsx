import { Stack } from '@mui/material';

import { JsonForms } from '@jsonforms/react';

import useConfigurationSchema from 'src/components/admin/Settings/StorageMappings/Dialog/useConfigurationSchema';
import { useStorageMappingStore } from 'src/components/admin/Settings/StorageMappings/Store/create';
import { jsonFormsPadding } from 'src/context/Theme';
import { jsonFormsDefaults } from 'src/services/jsonforms/defaults';

function StorageMappingForm() {
    const formValue = useStorageMappingStore((state) => state.formValue);
    const updateFormValue = useStorageMappingStore(
        (state) => state.updateFormValue
    );

    const { schema, uischema } = useConfigurationSchema();

    return (
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
    );
}

export default StorageMappingForm;

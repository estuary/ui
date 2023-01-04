import { materialCells } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Skeleton, Stack, StyledEngineProvider } from '@mui/material';
import { jsonFormsPadding } from 'context/Theme';
import { useEffect, useState } from 'react';
import defaultRenderers from 'services/jsonforms/defaultRenderers';
import { defaultOptions } from 'services/jsonforms/shared';
import {
    useStorageMappingsStore_loading,
    useStorageMappingsStore_spec,
} from 'stores/StorageMappings/hooks';
import ProviderSelector from './ProviderSelector';
import useFormSchema from './useFormSchema';

// TODO (storage mapping edit) - this is not used right now but will be when we add
//  storage mapping editing.
function Form() {
    const loading = useStorageMappingsStore_loading();
    const storageMappingSpecs = useStorageMappingsStore_spec();
    const { schema, uiSchema } = useFormSchema();

    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (storageMappingSpecs) {
            setFormData(storageMappingSpecs);
        }
    }, [storageMappingSpecs]);

    if (loading) {
        return <Skeleton />;
    }

    if (!storageMappingSpecs) {
        return <>No Spec to display</>;
    }

    return (
        <StyledEngineProvider injectFirst>
            <Stack
                sx={{
                    ...jsonFormsPadding,
                }}
            >
                <ProviderSelector />
                <JsonForms
                    readonly={true}
                    schema={schema}
                    uischema={uiSchema}
                    data={formData}
                    renderers={defaultRenderers}
                    cells={materialCells}
                    config={defaultOptions}
                />
            </Stack>
        </StyledEngineProvider>
    );
}

export default Form;

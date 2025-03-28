import { Box } from '@mui/material';

import SchemaEvolution from 'src/components/shared/Entity/Actions/SchemaEvolution';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';

function Actions() {
    const setFormState = useFormStateStore_setFormState();

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'flex-end',
            }}
        >
            <SchemaEvolution
                onFailure={(formState) => {
                    setFormState({
                        status: FormStatus.SCHEMA_EVOLVING_FAILED,
                        ...formState,
                    });
                }}
            />
        </Box>
    );
}

export default Actions;

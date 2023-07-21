import { Box } from '@mui/material';

import { useFormStateStore_setFormState } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';

import SchemaEvolution from '../Actions/SchemaEvolution';

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

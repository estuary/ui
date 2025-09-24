import type { MenuActionProps } from 'src/components/fieldSelection/types';

import { Box, Button, Stack } from '@mui/material';

import { useIntl } from 'react-intl';

import SaveButton from 'src/components/fieldSelection/FieldActions/AlgorithmMenu/SaveButton';
import { useBindingStore } from 'src/stores/Binding/Store';

export default function MenuActions({
    close,
    handleClick,
    loading,
}: MenuActionProps) {
    const intl = useIntl();

    const selectionAlgorithm = useBindingStore(
        (state) => state.selectionAlgorithm
    );
    const setSelectionAlgorithm = useBindingStore(
        (state) => state.setSelectionAlgorithm
    );

    return (
        <Stack
            direction="row"
            spacing={1}
            style={{ paddingBottom: 4, justifyContent: 'flex-end' }}
        >
            <Button
                component={Box}
                disabled={loading}
                onClick={() => {
                    close();
                    setSelectionAlgorithm(null);
                }}
                variant="text"
            >
                {intl.formatMessage({ id: 'cta.cancel' })}
            </Button>

            <SaveButton
                close={close}
                handleClick={handleClick}
                loading={loading}
                selectedAlgorithm={selectionAlgorithm}
            />
        </Stack>
    );
}

import type { MenuActionProps } from 'src/components/fieldSelection/types';

import { Box, Button, Stack } from '@mui/material';

import { useIntl } from 'react-intl';

import SaveButton from 'src/components/fieldSelection/FieldActions/AlgorithmMenu/SaveButton';
import { useBindingStore } from 'src/stores/Binding/Store';

export default function MenuActions({
    bindingUUID,
    closeMenu,
    loading,
    selections,
}: MenuActionProps) {
    const intl = useIntl();

    const selectionAlgorithm = useBindingStore(
        (state) => state.selectionAlgorithm
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
                    closeMenu();
                }}
                variant="text"
            >
                {intl.formatMessage({ id: 'cta.cancel' })}
            </Button>

            <SaveButton
                bindingUUID={bindingUUID}
                close={closeMenu}
                loading={loading}
                selections={selections}
                selectedAlgorithm={selectionAlgorithm}
            />
        </Stack>
    );
}

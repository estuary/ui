import type { MenuActionProps } from 'src/components/fieldSelection/types';

import { Box, Button, Stack } from '@mui/material';

import { useIntl } from 'react-intl';

import GenerateButton from 'src/components/fieldSelection/AlgorithmOutcome/GenerateButton';
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

            <GenerateButton
                bindingUUID={bindingUUID}
                closeMenu={closeMenu}
                loading={loading}
                selections={selections}
                selectedAlgorithm={selectionAlgorithm}
            />
        </Stack>
    );
}

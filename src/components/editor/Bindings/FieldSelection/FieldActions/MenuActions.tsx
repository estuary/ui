import { Box, Button, Stack } from '@mui/material';
import { useIntl } from 'react-intl';
import { useBindingStore } from 'stores/Binding/Store';
import SaveButton from './SaveButton';
import { MenuActionsProps } from './types';

export default function MenuActions({
    bindingUUID,
    closeMenu,
    loading,
    projections,
}: MenuActionsProps) {
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
                loading={loading}
                projections={projections}
                selectedValue={
                    selectionAlgorithm === 'excludeAll' ? 'exclude' : 'default'
                }
            />
        </Stack>
    );
}

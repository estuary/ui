import type { MenuActionProps } from 'src/components/fieldSelection/types';

import { Box, Button, Stack } from '@mui/material';

import { useIntl } from 'react-intl';

import SaveButton from 'src/components/fieldSelection/FieldActions/AlgorithmMenu/SaveButton';
import { useBindingStore } from 'src/stores/Binding/Store';

export default function MenuActions({
    bindingUUID,
    close,
    disabled,
    handleClick,
}: MenuActionProps) {
    const intl = useIntl();

    const selectionAlgorithm = useBindingStore((state) =>
        bindingUUID
            ? state.selections[bindingUUID].selectionAlgorithm
            : state.selectionAlgorithm
    );

    return (
        <Stack
            direction="row"
            spacing={1}
            style={{ paddingBottom: 4, justifyContent: 'flex-end' }}
        >
            <Button
                component={Box}
                disabled={disabled}
                onClick={close}
                variant="text"
            >
                {intl.formatMessage({ id: 'cta.cancel' })}
            </Button>

            <SaveButton
                close={close}
                disabled={disabled}
                handleClick={handleClick}
                selectedAlgorithm={selectionAlgorithm}
            />
        </Stack>
    );
}

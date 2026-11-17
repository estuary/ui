import type { MenuActionProps } from 'src/components/fieldSelection/types';

import { Box, Button, Stack } from '@mui/material';

import SaveButton from 'src/components/fieldSelection/FieldActions/AlgorithmMenu/SaveButton';

export default function MenuActions({
    close,
    disabled,
    handleClick,
    selectionAlgorithm,
}: MenuActionProps) {
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
                Cancel
            </Button>

            <SaveButton
                close={close}
                disabled={disabled}
                handleClick={handleClick}
                selectionAlgorithm={selectionAlgorithm}
            />
        </Stack>
    );
}

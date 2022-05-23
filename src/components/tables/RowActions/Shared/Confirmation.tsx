import { Box, Stack } from '@mui/material';
import { ReactNode } from 'react';

interface RowActionConfirmationprops {
    message: ReactNode;
    selected: any; //SelectableTableStore['selected'];
}

function RowActionConfirmation({
    message,
    selected,
}: RowActionConfirmationprops) {
    return (
        <>
            {message}
            <Stack direction="column">
                {selected.map((value: any, index: number) => {
                    return <Box key={index}>{value}</Box>;
                })}
            </Stack>
        </>
    );
}

export default RowActionConfirmation;

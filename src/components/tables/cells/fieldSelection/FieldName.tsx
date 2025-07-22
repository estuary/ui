import type { FieldNameProps } from 'src/components/tables/cells/types';

import { Stack, TableCell, Typography, useTheme } from '@mui/material';

import { WarningTriangle } from 'iconoir-react';

import { getStickyTableCell } from 'src/context/Theme';

const FieldName = ({ field, outcome }: FieldNameProps) => {
    const theme = useTheme();

    return (
        <TableCell sx={getStickyTableCell()}>
            <Stack direction="row" style={{ alignItems: 'center' }}>
                <Typography>{field}</Typography>

                {outcome?.select && outcome?.reject ? (
                    <WarningTriangle
                        style={{
                            color:
                                theme.palette.mode === 'light'
                                    ? theme.palette.warning.dark
                                    : theme.palette.warning.main,
                            fontSize: 12,
                            marginLeft: 6,
                        }}
                    />
                ) : null}
            </Stack>
        </TableCell>
    );
};

export default FieldName;

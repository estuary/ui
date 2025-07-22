import type { FieldNameProps } from 'src/components/tables/cells/types';

import { Stack, Typography, useTheme } from '@mui/material';

import { WarningTriangle } from 'iconoir-react';

import { hasFieldConflict } from 'src/utils/fieldSelection-utils';

const FieldConflictOverview = ({ field, outcome }: FieldNameProps) => {
    const theme = useTheme();

    return (
        <Stack spacing={1}>
            <Typography>{field}</Typography>

            <Typography>{`A conflict was found for field ${field}.`}</Typography>

            <Stack direction="row" style={{ alignItems: 'center' }}>
                <Typography>{field}</Typography>

                {hasFieldConflict(outcome) ? (
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
        </Stack>
    );
};

export default FieldConflictOverview;

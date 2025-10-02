import type { FieldNameProps } from 'src/components/tables/cells/types';

import { Stack, TableCell, Typography, useTheme } from '@mui/material';

import { Key } from 'iconoir-react';

import { wrappingTableBodyCell } from 'src/context/Theme';
import { useBindingStore } from 'src/stores/Binding/Store';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';
import {
    hasFieldConflict,
    isSelectedField,
} from 'src/utils/fieldSelection-utils';

const FieldName = ({ bindingUUID, field, outcome }: FieldNameProps) => {
    const theme = useTheme();

    const isGroupByKey = useBindingStore((state) =>
        bindingUUID && state.selections?.[bindingUUID]
            ? (state.selections[bindingUUID].groupBy.explicit.includes(field) ??
              state.selections[bindingUUID].groupBy.implicit.includes(field) ??
              false)
            : false
    );

    return (
        <TableCell sx={wrappingTableBodyCell}>
            {isGroupByKey ? (
                <Key
                    fontSize={14}
                    style={{
                        color: theme.palette.text.primary,
                        marginRight: 10,
                    }}
                />
            ) : (
                <div style={{ width: 21 }} />
            )}

            <OutlinedChip
                color={hasFieldConflict(outcome) ? 'error' : undefined}
                label={
                    <Stack
                        direction="row"
                        spacing={1}
                        style={{ alignItems: 'center' }}
                    >
                        <Typography>{field}</Typography>
                    </Stack>
                }
                variant="outlined"
                diminishedText={Boolean(
                    !isSelectedField(outcome) && !hasFieldConflict(outcome)
                )}
            />
        </TableCell>
    );
};

export default FieldName;

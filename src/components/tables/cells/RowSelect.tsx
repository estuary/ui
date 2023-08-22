import { Checkbox, TableCell } from '@mui/material';
import invariableStores from 'context/Zustand/invariableStores';
import { useMemo } from 'react';
import { useStore } from 'zustand';

interface Props {
    isSelected: boolean;
    name: string;
}

function RowSelect({ isSelected, name }: Props) {
    const [disabledRows] = useStore(
        invariableStores['Collections-Selector-Table'],
        (state) => {
            return [state.disabledRows];
        }
    );

    const disabled = useMemo(
        () => disabledRows.includes(name),
        [disabledRows, name]
    );

    console.log('row select', {
        disabledRows,
        disabled,
    });

    return (
        <TableCell
            padding="checkbox"
            sx={{
                maxWidth: 42,
                minWidth: 42,
            }}
        >
            <Checkbox
                color="primary"
                checked={isSelected}
                disabled={disabled}
                inputProps={{
                    'aria-labelledby': name,
                }}
            />
        </TableCell>
    );
}

export default RowSelect;

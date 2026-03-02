import type { DataPlaneNode } from 'src/api/dataPlanesGql';

import {
    Checkbox,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Stack,
} from '@mui/material';

import { toPresentableName } from 'src/utils/dataPlane-utils';

function DataPlaneSelector({
    options,
    allowPublicChecked,
    allowPublicDisabled,
    allowPublicVisible,
    onAccept,
    onToggleAllowPublic,
}: {
    options: DataPlaneNode[];
    allowPublicChecked: boolean;
    allowPublicDisabled: boolean;
    allowPublicVisible: boolean;
    onAccept: (dataPlane: DataPlaneNode) => void;
    onToggleAllowPublic: (value: boolean) => void;
}) {
    return (
        <Stack spacing={1} direction="row" alignItems="end" sx={{ px: 1 }}>
            <FormControl fullWidth size="small" required>
                <InputLabel>Data Plane</InputLabel>
                <Select
                    value=""
                    label="Data Plane"
                    onChange={(e) => {
                        const node = options.find(
                            (dp) => dp.name === e.target.value
                        );
                        if (node) {
                            onAccept(node);
                        }
                    }}
                >
                    {options.map((dp) => (
                        <MenuItem key={dp.name} value={dp.name}>
                            {toPresentableName(dp)} ({dp.scope})
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            {allowPublicVisible ? (
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={allowPublicChecked}
                            disabled={allowPublicDisabled}
                            onChange={(e) =>
                                onToggleAllowPublic(e.target.checked)
                            }
                            size="small"
                        />
                    }
                    label="Allow public"
                    slotProps={{
                        typography: { variant: 'body2' },
                    }}
                    sx={{ whiteSpace: 'nowrap' }}
                />
            ) : null}
        </Stack>
    );
}

export default DataPlaneSelector;

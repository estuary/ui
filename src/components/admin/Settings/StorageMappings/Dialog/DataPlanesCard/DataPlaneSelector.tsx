import type { MenuItemProps } from '@mui/material';
import type { DataPlaneNode } from 'src/api/gql/dataPlanes';

import {
    Checkbox,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Stack,
} from '@mui/material';

import { useLeaf } from 'react-semantic-tree';

import { Select } from 'src/components/shared/Semantic/Select';
import { toPresentableName } from 'src/utils/dataPlane-utils';

function DataPlaneOption({
    dataPlane,
    ...props
}: MenuItemProps & { dataPlane: DataPlaneNode }) {
    const { ref: semanticRef } = useLeaf(
        'Select',
        {
            name: dataPlane.name,
        },
        {
            hover: true,
        }
    );

    return <MenuItem {...props} ref={semanticRef} />;
}

export function DataPlaneSelector({
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
    const { ref: allowPublicRef } = useLeaf('Allow Public');

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
                        <DataPlaneOption
                            key={dp.name}
                            value={dp.name}
                            dataPlane={dp}
                        >
                            {toPresentableName(dp)} ({dp.scope})
                        </DataPlaneOption>
                    ))}
                </Select>
            </FormControl>
            {allowPublicVisible ? (
                <FormControlLabel
                    control={
                        <Checkbox
                            slotProps={{ input: { ref: allowPublicRef } }}
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

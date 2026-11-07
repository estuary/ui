import type { MenuItemProps } from '@mui/material';
import type { DataPlaneNode } from 'src/api/gql/dataPlanes';

import {
    Checkbox,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Stack,
} from '@mui/material';

import { useSemanticLeaf } from 'react-semantic-tree';

import { toPresentableName } from 'src/utils/dataPlane-utils';

function DataPlaneOption(props: MenuItemProps) {
    const { ref } = useSemanticLeaf<HTMLLIElement>('Select Data Plane');
    return <MenuItem {...props} ref={ref} />;
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
    const { ref: semanticAllowPublicDataPlanesRef } =
        useSemanticLeaf<HTMLInputElement>('Allow Public Data Planes');

    const { ref: openRef } =
        useSemanticLeaf<HTMLDivElement>('Choose Data Plane');
    return (
        <Stack spacing={1} direction="row" alignItems="end" sx={{ px: 1 }}>
            <FormControl fullWidth size="small" required>
                <InputLabel>{'Data Plane'}</InputLabel>
                <Select
                    SelectDisplayProps={{
                        ...{ ref: openRef },
                        role: 'combobox',
                    }}
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
                        <DataPlaneOption key={dp.name} value={dp.name}>
                            {toPresentableName(dp)} ({dp.scope})
                        </DataPlaneOption>
                    ))}
                </Select>
            </FormControl>
            {allowPublicVisible ? (
                <FormControlLabel
                    control={
                        <Checkbox
                            inputRef={semanticAllowPublicDataPlanesRef}
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

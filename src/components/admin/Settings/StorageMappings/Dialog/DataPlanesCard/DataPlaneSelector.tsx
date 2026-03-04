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

import { useIntl } from 'react-intl';

import { toPresentableName } from 'src/utils/dataPlane-utils';

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
    const intl = useIntl();
    return (
        <Stack spacing={1} direction="row" alignItems="end" sx={{ px: 1 }}>
            <FormControl fullWidth size="small" required>
                <InputLabel>
                    {intl.formatMessage({
                        id: 'storageMappings.dialog.dataPlanes.selector.label',
                    })}
                </InputLabel>
                <Select
                    value=""
                    label={intl.formatMessage({
                        id: 'storageMappings.dialog.dataPlanes.selector.label',
                    })}
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
                    label={intl.formatMessage({
                        id: 'storageMappings.dialog.dataPlanes.allowPublic',
                    })}
                    slotProps={{
                        typography: { variant: 'body2' },
                    }}
                    sx={{ whiteSpace: 'nowrap' }}
                />
            ) : null}
        </Stack>
    );
}

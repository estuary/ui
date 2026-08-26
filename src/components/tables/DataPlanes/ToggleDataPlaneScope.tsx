import { ToggleButtonGroup } from '@mui/material';
import { useCallback } from 'react';

import OutlinedToggleButton from 'src/components/shared/buttons/OutlinedToggleButton';
import type { DataPlaneScopes } from 'src/stores/DetailsForm/types';

type ToggleDataPlaneScopeProps = {
    scope: DataPlaneScopes;
    onChange?: (newScope: DataPlaneScopes) => void;
};

function ToggleDataPlaneScope({ scope, onChange }: ToggleDataPlaneScopeProps) {
    const handleChange = useCallback(
        (_event: any, newValue: DataPlaneScopes) => {
            onChange?.(newValue);
        },
        [onChange]
    );

    return (
        <ToggleButtonGroup
            color="primary"
            size="small"
            exclusive
            value={scope}
            onChange={handleChange}
        >
            <OutlinedToggleButton
                selected={scope === 'private'}
                size="small"
                value="private"
            >
                Private
            </OutlinedToggleButton>
            <OutlinedToggleButton
                selected={scope === 'public'}
                size="small"
                value="public"
            >
                Public
            </OutlinedToggleButton>
        </ToggleButtonGroup>
    );
}

export default ToggleDataPlaneScope;

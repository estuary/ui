import type { DataPlaneScopes } from 'src/stores/DetailsForm/types';

import { useCallback } from 'react';

import { ToggleButtonGroup } from '@mui/material';

import { useLeaf } from 'react-semantic-tree';

import OutlinedToggleButton from 'src/components/shared/buttons/OutlinedToggleButton';

type ToggleDataPlaneScopeProps = {
    scope: DataPlaneScopes;
    onChange?: (newScope: DataPlaneScopes) => void;
};

function ToggleDataPlaneScope({ scope, onChange }: ToggleDataPlaneScopeProps) {
    const { ref: semanticPublicDataPlanesRef } = useLeaf('Public');
    const { ref: semanticPrivateDataPlanesRef } = useLeaf('Private');

    const handleChange = useCallback(
        (_event: any, newValue: DataPlaneScopes) => {
            if (newValue && newValue !== scope) {
                onChange?.(newValue);
            }
        },
        [scope, onChange]
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
                ref={semanticPublicDataPlanesRef}
                selected={scope === 'public'}
                size="small"
                value="public"
            >
                Public
            </OutlinedToggleButton>
            <OutlinedToggleButton
                ref={semanticPrivateDataPlanesRef}
                selected={scope === 'private'}
                size="small"
                value="private"
            >
                Private
            </OutlinedToggleButton>
        </ToggleButtonGroup>
    );
}

export default ToggleDataPlaneScope;

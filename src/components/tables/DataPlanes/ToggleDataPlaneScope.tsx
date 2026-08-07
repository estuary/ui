import { ToggleButtonGroup } from '@mui/material';

import OutlinedToggleButton from 'src/components/shared/buttons/OutlinedToggleButton';
import { useDataPlaneScope } from 'src/context/DataPlaneScopeContext';

function ToggleDataPlaneScope() {
    const { dataPlaneScope, toggleScope } = useDataPlaneScope();

    return (
        <ToggleButtonGroup
            color="primary"
            size="small"
            exclusive
            value={dataPlaneScope}
        >
            <OutlinedToggleButton
                onClick={() => toggleScope()}
                selected={dataPlaneScope === 'private'}
                size="small"
                value="private"
            >
                Private
            </OutlinedToggleButton>
            <OutlinedToggleButton
                onClick={() => toggleScope()}
                selected={dataPlaneScope === 'public'}
                size="small"
                value="public"
            >
                Public
            </OutlinedToggleButton>
        </ToggleButtonGroup>
    );
}

export default ToggleDataPlaneScope;

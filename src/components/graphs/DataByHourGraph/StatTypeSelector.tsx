import { useShallow } from 'zustand/react/shallow';

import OutlinedToggleButton from 'src/components/shared/buttons/OutlinedToggleButton';
import OutlinedToggleButtonGroup from 'src/components/shared/OutlinedToggleButtonGroup';
import { useDetailsUsageStore } from 'src/stores/DetailsUsage/useDetailsUsageStore';

function StatTypeSelector() {
    const [statType, setStatType] = useDetailsUsageStore(
        useShallow((state) => [state.statType, state.setStatType])
    );

    return (
        <OutlinedToggleButtonGroup size="small" exclusive>
            <OutlinedToggleButton
                size="small"
                value="bytes"
                selected={statType === 'bytes'}
                onClick={() => setStatType('bytes')}
            >
                Data
            </OutlinedToggleButton>

            <OutlinedToggleButton
                size="small"
                value="docs"
                selected={statType === 'docs'}
                onClick={() => setStatType('docs')}
            >
                Docs
            </OutlinedToggleButton>
        </OutlinedToggleButtonGroup>
    );
}

export default StatTypeSelector;

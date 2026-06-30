import { useShallow } from 'zustand/react/shallow';

import { useIntl } from 'react-intl';

import OutlinedToggleButton from 'src/components/shared/buttons/OutlinedToggleButton';
import OutlinedToggleButtonGroup from 'src/components/shared/OutlinedToggleButtonGroup';
import { useDetailsUsageStore } from 'src/stores/DetailsUsage/useDetailsUsageStore';

function StatTypeSelector() {
    const intl = useIntl();

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
                {intl.formatMessage({ id: 'data.data' })}
            </OutlinedToggleButton>

            <OutlinedToggleButton
                size="small"
                value="docs"
                selected={statType === 'docs'}
                onClick={() => setStatType('docs')}
            >
                {intl.formatMessage({ id: 'data.docs' })}
            </OutlinedToggleButton>
        </OutlinedToggleButtonGroup>
    );
}

export default StatTypeSelector;

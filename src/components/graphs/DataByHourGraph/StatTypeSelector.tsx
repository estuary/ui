import { useShallow } from 'zustand/react/shallow';

import { useIntl } from 'react-intl';

import OutlinedToggleButton from 'src/components/shared/buttons/OutlinedToggleButton';
import OutlinedToggleButtonGroup from 'src/components/shared/OutlinedToggleButtonGroup';
import { useDetailsUsageStore } from 'src/stores/DetailsUsage/useDetailsUsageStore';

// MUI uppercases ToggleButton labels. The theme already opts MuiButton and
// MuiTab out of that, but not MuiToggleButton, so "Data"/"Docs" arrived here as
// DATA/DOCS — shouting, next to a card heading that does not. Scoped to this
// selector rather than the theme: five other toggle groups would change with it.
const sentenceCaseSx = { textTransform: 'none' } as const;

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
                sx={sentenceCaseSx}
                onClick={() => setStatType('bytes')}
            >
                {intl.formatMessage({ id: 'data.data' })}
            </OutlinedToggleButton>

            <OutlinedToggleButton
                size="small"
                value="docs"
                selected={statType === 'docs'}
                sx={sentenceCaseSx}
                onClick={() => setStatType('docs')}
            >
                {intl.formatMessage({ id: 'data.docs' })}
            </OutlinedToggleButton>
        </OutlinedToggleButtonGroup>
    );
}

export default StatTypeSelector;

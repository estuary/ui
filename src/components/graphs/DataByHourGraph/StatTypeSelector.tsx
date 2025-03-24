import OutlinedToggleButton from 'components/shared/buttons/OutlinedToggleButton';
import OutlinedToggleButtonGroup from 'components/shared/OutlinedToggleButtonGroup';
import { FormattedMessage } from 'react-intl';
import { useDetailsUsageStore } from 'stores/DetailsUsage/useDetailsUsageStore';

function StatTypeSelector() {
    const [statType, setStatType] = useDetailsUsageStore((store) => [
        store.statType,
        store.setStatType,
    ]);

    return (
        <OutlinedToggleButtonGroup size="small" exclusive>
            <OutlinedToggleButton
                size="small"
                value="bytes"
                selected={statType === 'bytes'}
                onClick={() => setStatType('bytes')}
            >
                <FormattedMessage id="data.data" />
            </OutlinedToggleButton>

            <OutlinedToggleButton
                size="small"
                value="docs"
                selected={statType === 'docs'}
                onClick={() => setStatType('docs')}
            >
                <FormattedMessage id="data.docs" />
            </OutlinedToggleButton>
        </OutlinedToggleButtonGroup>
    );
}

export default StatTypeSelector;

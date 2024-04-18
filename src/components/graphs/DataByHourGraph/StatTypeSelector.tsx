import { ToggleButtonGroup } from '@mui/material';
import useDetailsUsageStore from 'components/shared/Entity/Details/Usage/useDetailsUsageStore';
import OutlinedToggleButton from 'components/shared/OutlinedToggleButton';
import { outlinedToggleButtonGroupStyling } from 'context/Theme';
import { FormattedMessage } from 'react-intl';

function StatTypeSelector() {
    const [statType, setStatType] = useDetailsUsageStore((store) => [
        store.statType,
        store.setStatType,
    ]);

    return (
        <ToggleButtonGroup
            size="small"
            exclusive
            sx={outlinedToggleButtonGroupStyling}
        >
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
        </ToggleButtonGroup>
    );
}

export default StatTypeSelector;

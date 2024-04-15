import { ToggleButtonGroup } from '@mui/material';
import { DataByHourStatType } from 'components/graphs/types';
import OutlinedToggleButton from 'components/shared/OutlinedToggleButton';
import { outlinedToggleButtonGroupStyling } from 'context/Theme';
import { FormattedMessage } from 'react-intl';

interface Props {
    statType: DataByHourStatType;
    setStatType: (range: DataByHourStatType) => void;
}

function StatTypePicker({ statType, setStatType }: Props) {
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

export default StatTypePicker;

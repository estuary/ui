import { MenuItem } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import type { StatsFilter } from 'src/api/stats';

interface Props {
    currentOption: StatsFilter;
    onClick: (option: StatsFilter) => void;
    option: StatsFilter;
}

function DateFilterOption({ currentOption, onClick, option }: Props) {
    return (
        <MenuItem
            onClick={() => onClick(option)}
            selected={Boolean(currentOption === option)}
        >
            <FormattedMessage id={`filter.time.${option}`} />
        </MenuItem>
    );
}

export default DateFilterOption;

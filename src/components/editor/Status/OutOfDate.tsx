import { Cloud } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    iconSize: number;
}

function OutOfDate({ iconSize }: Props) {
    return (
        <>
            <Typography>
                <FormattedMessage id="common.outOfDate" />
            </Typography>

            <Cloud
                sx={{
                    color: (theme) => theme.palette.error.main,
                    fontSize: iconSize,
                }}
            />
        </>
    );
}

export default OutOfDate;

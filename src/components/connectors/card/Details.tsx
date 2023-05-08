import { Stack, Typography } from '@mui/material';
import { FormattedDate, FormattedMessage } from 'react-intl';

interface Props {
    description: string;
    lastUpdate: any;
    specType: string;
}

const labelSx = {
    marginRight: '.5rem',
    fontWeight: 500,
};

function ConnectorCardDetails({ description, lastUpdate, specType }: Props) {
    return (
        <Stack direction="column" spacing={1} sx={{ alignItems: 'baseline' }}>
            <Typography component="div">
                <span style={labelSx}>
                    <FormattedMessage id="entityTable.data.specTypeWithColon" />
                </span>

                <FormattedMessage id={`terms.${specType}`} />
            </Typography>

            <Typography component="div">
                <span style={labelSx}>
                    <FormattedMessage id="entityTable.data.lastUpdatedWithColon" />
                </span>

                <FormattedDate
                    day="numeric"
                    month="long"
                    year="numeric"
                    value={lastUpdate}
                />
            </Typography>

            <Typography component="div" variant="subtitle1">
                {description}
            </Typography>
        </Stack>
    );
}

export default ConnectorCardDetails;

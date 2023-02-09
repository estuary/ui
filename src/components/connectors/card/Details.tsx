import { Stack, Typography } from '@mui/material';
import { FormattedDate, FormattedMessage } from 'react-intl';

interface Props {
    description: string;
    lastUpdate: any;
}

function ConnectorCardDetails({ description, lastUpdate }: Props) {
    return (
        <Stack direction="column" spacing={1} sx={{ alignItems: 'baseline' }}>
            <Typography component="div">
                <span
                    style={{
                        marginRight: '.5rem',
                        fontWeight: 500,
                    }}
                >
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

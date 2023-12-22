import { Stack, Typography } from '@mui/material';

interface Props {
    description: string;
}

function ConnectorCardDetails({ description }: Props) {
    return (
        <Stack direction="column" spacing={1} sx={{ alignItems: 'baseline' }}>
            <Typography align="left" component="div" variant="subtitle1">
                {description}
            </Typography>
        </Stack>
    );
}

export default ConnectorCardDetails;

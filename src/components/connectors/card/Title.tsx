import { Typography } from '@mui/material';

interface Props {
    title: string;
}

function ConnectorCardTitle({ title }: Props) {
    return (
        <Typography component="div" variant="h5" marginBottom={1}>
            {title}
        </Typography>
    );
}

export default ConnectorCardTitle;

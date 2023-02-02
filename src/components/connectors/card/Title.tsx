import { Typography } from '@mui/material';

interface Props {
    title: string;
}

function ConnectorCardTitle({ title }: Props) {
    return (
        <Typography
            component="div"
            variant="h6"
            marginBottom={1}
            fontWeight="400"
        >
            {title}
        </Typography>
    );
}

export default ConnectorCardTitle;

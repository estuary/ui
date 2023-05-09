import { Typography } from '@mui/material';

interface Props {
    title: string;
}

function ConnectorCardTitle({ title }: Props) {
    return (
        <Typography
            component="div"
            marginBottom={1}
            fontSize={18}
            fontWeight="400"
            align="left"
        >
            {title}
        </Typography>
    );
}

export default ConnectorCardTitle;

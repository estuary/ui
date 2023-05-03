import { TableCell, Tooltip, Typography } from '@mui/material';

interface Props {
    token: string;
}

function TruncatedToken({ token }: Props) {
    return (
        <TableCell>
            <Tooltip title={token}>
                <Typography>{`${token.substring(0, 8)}...`}</Typography>
            </Tooltip>
        </TableCell>
    );
}

export default TruncatedToken;

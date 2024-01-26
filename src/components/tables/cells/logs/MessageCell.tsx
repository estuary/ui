import { TableCell, Typography } from '@mui/material';
import { ObjectPreview } from 'react-inspector';
import { BaseTypographySx } from './shared';

interface Props {
    message: string;
    width: number;
    fields?: any;
}

function MessageCell({ fields, message, width }: Props) {
    const roomLeft = width - 245 - 65;
    return (
        <TableCell style={{ width: roomLeft }}>
            <Typography
                component="div"
                sx={{
                    ...BaseTypographySx,
                    width: '100%',
                }}
            >
                {roomLeft} | {message} {message} {message} {message} {message}{' '}
                {message} {message} {message} {message} {message} {message}
            </Typography>

            {fields ? (
                <Typography component="div" sx={BaseTypographySx}>
                    <ObjectPreview data={fields} />
                </Typography>
            ) : null}
        </TableCell>
    );
}

export default MessageCell;

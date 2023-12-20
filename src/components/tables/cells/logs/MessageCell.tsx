import { TableCell, Typography } from '@mui/material';
import { ObjectPreview } from 'react-inspector';
import { BaseTypographySx } from './shared';

interface Props {
    message: string;
    fields?: any;
}

function MessageCell({ fields, message }: Props) {
    console.log('MessageCell', message);
    return (
        <TableCell>
            <Typography
                component="div"
                sx={{
                    ...BaseTypographySx,
                    width: '100%',
                }}
            >
                {message}
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

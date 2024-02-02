import { TableCell, Typography } from '@mui/material';
import { isEmpty } from 'lodash';
import { ObjectPreview } from 'react-inspector';
import { BaseTypographySx } from './shared';

interface Props {
    message: string;
    fields?: any;
}

function MessageCell({ fields, message }: Props) {
    return (
        <TableCell style={{ width: '100%' }} component="div">
            <Typography
                component="div"
                sx={{
                    ...BaseTypographySx,
                    width: '100%',
                }}
            >
                {message}
            </Typography>

            {!isEmpty(fields) ? (
                <Typography component="div" sx={{ ...BaseTypographySx }}>
                    <ObjectPreview data={fields} />
                </Typography>
            ) : null}
        </TableCell>
    );
}

export default MessageCell;

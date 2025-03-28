import { TableCell, Typography } from '@mui/material';
import { jsonObjectPreview_key, jsonObjectPreview_value } from 'src/context/Theme';
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
                <Typography
                    component="div"
                    sx={{
                        ...BaseTypographySx,
                        // The object preview does not accept themeing so manually setting these on the wrapper
                        //  obviously these are fairly brittle. They prevent some styling to come through (like color for types of data)
                        //  but I think that is okay given
                        '& > span span:first-of-type': {
                            color: (theme) =>
                                `${
                                    jsonObjectPreview_key[theme.palette.mode]
                                } !important`,
                            [`& + span`]: {
                                color: (theme) =>
                                    `${
                                        jsonObjectPreview_value[
                                            theme.palette.mode
                                        ]
                                    } !important`,
                            },
                        },
                    }}
                >
                    <ObjectPreview data={fields} />
                </Typography>
            ) : null}
        </TableCell>
    );
}

export default MessageCell;

import { Stack, Typography } from '@mui/material';
import MessageWithEmphasis from 'components/content/MessageWithEmphasis';
import { registerPerkCheck, registerPerkHighlight } from 'context/Theme';
import { CheckCircleSolid } from 'iconoir-react';

interface Props {
    messageID: string;
}

function RegisterPerk({ messageID }: Props) {
    return (
        <Stack direction="row" spacing={1}>
            <Typography
                sx={{
                    color: (theme) => registerPerkCheck[theme.palette.mode],
                }}
            >
                <CheckCircleSolid />
            </Typography>

            <Typography
                sx={{
                    'whiteSpace': 'nowrap',
                    '& b': {
                        color: (theme) =>
                            registerPerkHighlight[theme.palette.mode],
                    },
                }}
            >
                <MessageWithEmphasis messageID={messageID} />
            </Typography>
        </Stack>
    );
}

export default RegisterPerk;

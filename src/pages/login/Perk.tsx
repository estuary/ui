import { Box, Stack } from '@mui/material';
import MessageWithEmphasis from 'src/components/content/MessageWithEmphasis';
import { registerPerkCheck, registerPerkHighlight } from 'src/context/Theme';
import { CheckCircleSolid } from 'iconoir-react';

interface Props {
    messageID: string;
}

function RegisterPerk({ messageID }: Props) {
    return (
        <Stack direction="row" spacing={1}>
            <Box
                sx={{
                    color: (theme) => registerPerkCheck[theme.palette.mode],
                }}
            >
                <CheckCircleSolid />
            </Box>

            <Box
                sx={{
                    'whiteSpace': 'nowrap',
                    '& b': {
                        color: (theme) =>
                            registerPerkHighlight[theme.palette.mode],
                    },
                }}
            >
                <MessageWithEmphasis messageID={messageID} />
            </Box>
        </Stack>
    );
}

export default RegisterPerk;

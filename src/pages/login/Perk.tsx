import type { RegisterPerkProps } from 'src/pages/login/types';

import { Box, Stack } from '@mui/material';

import { CheckCircleSolid, NavArrowRight } from 'iconoir-react';

import MessageWithEmphasis from 'src/components/content/MessageWithEmphasis';
import {
    diminishedTextColor,
    registerPerkCheck,
    registerPerkHighlight,
} from 'src/context/Theme';

function RegisterPerk({
    disableEmphasisColor,
    disableNoWrap,
    messageID,
}: RegisterPerkProps) {
    return (
        <Stack direction="row" spacing={1}>
            <Box
                sx={{
                    alignContent: 'center',
                    color: disableEmphasisColor
                        ? undefined
                        : (theme) => registerPerkCheck[theme.palette.mode],
                }}
            >
                {disableEmphasisColor ? (
                    <NavArrowRight />
                ) : (
                    <CheckCircleSolid />
                )}
            </Box>

            <Box
                sx={{
                    'whiteSpace': disableNoWrap ? undefined : 'nowrap',
                    '& b': {
                        color: (theme) =>
                            disableEmphasisColor
                                ? diminishedTextColor[theme.palette.mode]
                                : registerPerkHighlight[theme.palette.mode],
                    },
                }}
            >
                <MessageWithEmphasis messageID={messageID} />
            </Box>
        </Stack>
    );
}

export default RegisterPerk;

import { Box, Typography } from '@mui/material';

import { QuoteSolid } from 'iconoir-react';

import flashpackLogo from 'src/images/flashpackLogo.png';

export function CustomerQuote() {
    return (
        <Box
            sx={{
                alignItems: 'center',
                display: 'flex',
                height: '100%',
                justifyContent: 'center',
                width: '100%',
            }}
        >
            <Box component="figure" sx={{ m: 0, width: '85%' }}>
                <Box
                    aria-hidden="true"
                    sx={{ color: 'text.primary', lineHeight: 0 }}
                >
                    <QuoteSolid
                        width={52}
                        height={52}
                        style={{ transform: 'rotate(180deg)' }}
                    />
                </Box>
                <Typography
                    component="blockquote"
                    sx={{
                        borderLeft: '2px solid gray',
                        paddingLeft: 2,
                        m: 2,
                        color: 'text.primary',
                        fontSize: 20,
                        fontWeight: 200,
                        lineHeight: 1.6,
                    }}
                >
                    {`We're a big fan of Estuary's real-time, no code
                    model. It's magic that we're getting real time
                    data without much effort and we don't have to spend
                    time thinking about broken pipelines. We've also
                    experienced fantastic support!`}
                </Typography>
                <Typography
                    component="figcaption"
                    sx={{
                        mt: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        color: 'text.primary',
                        fontWeight: 500,
                        fontSize: 16,
                    }}
                >
                    <Box
                        component="img"
                        src={flashpackLogo}
                        alt=""
                        sx={{
                            width: 36,
                            height: 36,
                            objectFit: 'contain',
                            filter: 'invert(1)',
                        }}
                    />
                    Flashpack
                </Typography>
            </Box>
        </Box>
    );
}

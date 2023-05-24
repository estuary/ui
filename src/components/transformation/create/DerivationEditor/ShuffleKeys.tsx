import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import { defaultOutline, intensifiedOutline } from 'context/Theme';
import { HelpCircle, NavArrowDown } from 'iconoir-react';

function ShuffleKeys() {
    const theme = useTheme();

    return (
        <Accordion
            sx={{
                'borderLeft': intensifiedOutline[theme.palette.mode],
                'borderRight': intensifiedOutline[theme.palette.mode],
                'borderBottom': intensifiedOutline[theme.palette.mode],
                ':last-of-type': {
                    borderRadius: 0,
                },
                '&.Mui-expanded': {
                    mt: 0,
                    flexGrow: 1,
                },
            }}
        >
            <AccordionSummary
                expandIcon={
                    <NavArrowDown
                        style={{
                            color: theme.palette.text.primary,
                        }}
                    />
                }
                sx={{
                    'px': 1,
                    '& .MuiAccordionSummary-content': {
                        'my': 0,
                        '&.Mui-expanded': {
                            my: 0,
                        },
                    },
                    '&.Mui-expanded': {
                        minHeight: 48,
                        my: 0,
                        borderBottom: defaultOutline[theme.palette.mode],
                    },
                }}
            >
                <Typography sx={{ fontWeight: 500 }}>
                    Advanced Streaming Settings
                </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0, px: 0, borderBottomLeftRadius: 4 }}>
                <Box sx={{ p: 1 }}>
                    <Stack
                        spacing={1}
                        direction="row"
                        sx={{ mb: 3, alignItems: 'center' }}
                    >
                        <Typography sx={{ fontWeight: 500 }}>
                            Shuffle Keys
                        </Typography>

                        <Tooltip
                            title="Select a key from your source collection schemas to help scale joins"
                            placement="right"
                        >
                            <HelpCircle
                                style={{
                                    fontSize: 12,
                                    color: theme.palette.text.primary,
                                }}
                            />
                        </Tooltip>
                    </Stack>

                    <Typography sx={{ px: 1 }}>
                        Soon you will be able to shuffle some keys!
                    </Typography>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}

export default ShuffleKeys;

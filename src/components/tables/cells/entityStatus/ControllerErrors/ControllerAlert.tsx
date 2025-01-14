import Editor from '@monaco-editor/react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Typography,
    useTheme,
} from '@mui/material';
import { defaultOutline } from 'context/Theme';
import { NavArrowDown } from 'iconoir-react';
import { useState } from 'react';
import { unescapeString } from 'utils/misc-utils';
import { ControllerAlertProps } from './types';

export default function ControllerAlert({
    error,
    hideBorder,
    mountClosed,
}: ControllerAlertProps) {
    const theme = useTheme();

    const [expanded, setExpanded] = useState(!mountClosed);

    return (
        <Accordion
            defaultExpanded={!mountClosed}
            onChange={() => setExpanded(!expanded)}
            sx={{
                borderBottom:
                    expanded || hideBorder
                        ? 'none'
                        : defaultOutline[theme.palette.mode],
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
            >
                <Typography>{error.scope}</Typography>
            </AccordionSummary>

            <AccordionDetails>
                <Box sx={{ height: 100 }}>
                    <Editor
                        defaultLanguage=""
                        theme={
                            theme.palette.mode === 'light' ? 'vs' : 'vs-dark'
                        }
                        options={{
                            lineNumbers: 'off',
                            readOnly: true,
                            scrollBeyondLastLine: false,
                            minimap: {
                                enabled: false,
                            },
                        }}
                        value={unescapeString(error.detail)}
                    />
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}

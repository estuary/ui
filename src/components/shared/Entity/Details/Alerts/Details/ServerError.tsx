import type { FooDetailsProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { useState } from 'react';

import {
    Box,
    Button,
    Dialog,
    DialogContent,
    Paper,
    useTheme,
} from '@mui/material';

import Editor from '@monaco-editor/react';
import { useIntl } from 'react-intl';

import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';
import { unescapeString } from 'src/utils/misc-utils';

function ServerError({ datum, details }: FooDetailsProps) {
    const intl = useIntl();
    const theme = useTheme();

    const [open, setOpen] = useState(false);

    const closeDialog = (event: React.MouseEvent<HTMLElement>) => {
        setOpen(false);
    };

    const detailsDialogId = `alert-details-${datum.firedAt}_${datum.alertType}`;

    return (
        <>
            <Paper
                variant="outlined"
                sx={{
                    p: 1,
                    minHeight: 100,
                    maxHeight: 100,
                    fontFamily: `'Monaco', monospace`,
                }}
            >
                {details[0].dataVal}
                <Button onClick={() => setOpen(true)}>open</Button>
            </Paper>
            <Dialog open={open} maxWidth="lg" onClose={closeDialog}>
                <DialogTitleWithClose
                    id={detailsDialogId}
                    onClose={() => setOpen(false)}
                >
                    {intl.formatMessage({ id: 'alerts.details.title' })}
                </DialogTitleWithClose>

                <DialogContent>
                    <Box
                        sx={{
                            height: '75vh',
                            width: '75vw',
                            [`& .something`]: {
                                flewGrow: 1,
                            },
                        }}
                    >
                        <Editor
                            defaultLanguage=""
                            theme={
                                theme.palette.mode === 'light'
                                    ? 'vs'
                                    : 'vs-dark'
                            }
                            options={{
                                lineNumbers: 'off',
                                minimap: {
                                    enabled: false,
                                },
                                readOnly: true,
                                scrollBeyondLastLine: false,
                            }}
                            value={unescapeString(
                                details[0].dataVal
                                // .join(NEW_LINE)
                                // .split(/\\n/)
                                // .join(NEW_LINE)
                            )}
                        />
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ServerError;

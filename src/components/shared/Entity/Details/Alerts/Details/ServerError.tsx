import type { AlertDetailsProps } from 'src/components/shared/Entity/Details/Alerts/types';

import { List, Paper, Stack, useTheme } from '@mui/material';

import LogLine from 'src/components/logs/Line';
import ServerErrorDialog from 'src/components/shared/Entity/Details/Alerts/Details/ServerErrorDialog';
import { defaultOutline, zIndexIncrement } from 'src/context/Theme';

const maxLengthDetail = 350;

function ServerError(props: AlertDetailsProps) {
    const { details } = props;
    const { dataVal } = details[0];
    const theme = useTheme();

    // Just being safe on the rare case we do not get the data we're expecting
    if (!dataVal) {
        return null;
    }

    const dataValIsLong = dataVal.length > maxLengthDetail;
    const logs = dataVal.split('\n').slice(0, 5);

    console.log('dataVal', dataVal);
    console.log('logs', logs);

    return (
        <Paper
            sx={{
                border: defaultOutline[theme.palette.mode],
                height: 150,
                maxHeight: 150,
                [`&:hover > button,  &:focus > button`]: {
                    opacity: 0.5,
                    transition: `750ms`,
                },
                [`& > button`]: {
                    [`&:hover, &:focus`]: {
                        opacity: 1,
                        transition: `750ms`,
                    },
                    bottom: 10,
                    height: 25,
                    minWidth: 'fit-content',
                    opacity: 0,
                    transition: `750ms`,
                    p: 0.25,
                    position: 'absolute',
                    right: 0,
                    width: 25,
                    zIndex: zIndexIncrement + zIndexIncrement,
                },
                [`& > ul`]: {
                    fontFamily: `'Monaco', monospace`,
                    whiteSpace: 'pre',
                    width: '100%',
                },
            }}
        >
            <Stack spacing={2}>
                <List
                    dense
                    sx={{
                        background: '#121212',
                        color: '#E1E9F4',
                        position: 'absolute',
                        zIndex: zIndexIncrement,
                    }}
                >
                    {logs.map((line: any, index: number) => (
                        <LogLine
                            key={`logLine-${index}`}
                            line={line}
                            lineNumber={index}
                            disableSelect
                            disableLineNumber
                        />
                    ))}
                </List>
            </Stack>
            {dataValIsLong ? <ServerErrorDialog {...props} /> : null}
        </Paper>
    );
}

export default ServerError;

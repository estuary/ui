import { Box, ListItem, Stack } from '@mui/material';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    lineNumber?: any;
    disableSelect?: boolean;
    lineNumberColor?: string;
}

export const defaultLineNumberColor = '#666';

function LogLineWrapper({
    children,
    disableSelect,
    lineNumber,
    lineNumberColor,
}: Props) {
    return (
        <ListItem
            sx={{
                'userSelect': disableSelect ? 'none' : undefined,
                'py': 0,
                '&:hover': {
                    background: (theme) =>
                        theme.palette.mode === 'dark' ? '#222' : '#eee',
                },
            }}
        >
            <Stack direction="row" spacing={2}>
                {lineNumber ? (
                    <Box
                        sx={{
                            color: lineNumberColor ?? defaultLineNumberColor,
                            userSelect: 'none',
                            minWidth: 50,
                            textAlign: 'right',
                            pt: 0.5,
                        }}
                    >
                        {lineNumber}
                    </Box>
                ) : null}

                {children}
            </Stack>
        </ListItem>
    );
}

export default LogLineWrapper;

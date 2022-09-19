import { Box, ListItem, Stack } from '@mui/material';
import { parse } from 'ansicolor';
import LinePart from './LinePart';

interface Props {
    line: any;
    lineNumber: number | string | any;
    disableSelect?: boolean;
}

export const lineNumberColor = '#666';

function LogLine({ line, lineNumber, disableSelect }: Props) {
    const parsedLine = parse(line.log_line);

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
            <Stack
                direction="row"
                spacing={2}
                sx={{
                    alignItems: 'center',
                }}
            >
                <Box
                    sx={{
                        color: lineNumberColor,
                        userSelect: 'none',
                        minWidth: 50,
                        textAlign: 'right',
                    }}
                >
                    {lineNumber}
                </Box>

                {parsedLine.spans.map((span, index, array) => (
                    <LinePart
                        key={`${span.text}-linePart-${index}`}
                        parsedLine={span}
                        lastPart={index + 1 === array.length}
                    />
                ))}
            </Stack>
        </ListItem>
    );
}

export default LogLine;

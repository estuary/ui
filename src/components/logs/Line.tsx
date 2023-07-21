import { parse } from 'ansicolor';
import { ViewLogs_Line } from 'types';

import { Box, ListItem, Stack } from '@mui/material';

import LinePart from './LinePart';

interface Props {
    line: ViewLogs_Line | string;
    lineNumber: number | string | any;
    disableSelect?: boolean;
}

export const lineNumberColor = '#666';

// const parseStream = (line: ViewLogs_Line): ParsedStream => {
//     return line.stream.slice(0, line.stream.lastIndexOf(':')) as ParsedStream;
// };

function LogLine({ line, lineNumber, disableSelect }: Props) {
    let parsedLine;

    if (line instanceof Object) {
        parsedLine = parse(line.log_line);
    } else {
        parsedLine = parse(line);
    }

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
                <Box
                    sx={{
                        color: lineNumberColor,
                        userSelect: 'none',
                        minWidth: 50,
                        textAlign: 'right',
                        pt: 0.5,
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

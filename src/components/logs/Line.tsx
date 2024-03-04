/* eslint-disable react/jsx-no-useless-fragment */
import { ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { parse } from 'ansicolor';
import { useMemo } from 'react';
import { ViewLogs_Line } from 'types';
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
    let parsedLine: any;

    if (line instanceof Object) {
        parsedLine = parse(line.log_line);
    } else {
        parsedLine = parse(line);
    }

    const reneredParsedLine = useMemo(() => {
        return parsedLine.spans.map(
            (span: any, index: number, array: any[]) => (
                <LinePart
                    key={`${span.text}-linePart-${index}`}
                    parsedLine={span}
                    lastPart={index + 1 === array.length}
                />
            )
        );
    }, [parsedLine.spans]);

    return (
        <ListItem
            alignItems="flex-start"
            sx={{
                'userSelect': disableSelect ? 'none' : undefined,
                'py': 0,
                '&:hover': {
                    background: (theme) =>
                        theme.palette.mode === 'dark' ? '#222' : '#eee',
                },
            }}
        >
            <ListItemAvatar
                sx={{
                    alignItems: 'baseline',
                    color: lineNumberColor,
                    userSelect: 'none',
                    minWidth: 50,
                    textAlign: 'right',
                    mr: 1,
                    mt: 0.5,
                }}
            >
                {lineNumber}
            </ListItemAvatar>
            <ListItemText
                disableTypography
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                }}
            >
                {reneredParsedLine}
            </ListItemText>

            {/*<Stack direction="row" spacing={2}>
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

                <Stack direction="row">
                    {parsedLine.spans.map((span, index, array) => (
                        <LinePart
                            key={`${span.text}-linePart-${index}`}
                            parsedLine={span}
                            lastPart={index + 1 === array.length}
                        />
                    ))}
                </Stack>
            </Stack>*/}
        </ListItem>
    );
}

export default LogLine;

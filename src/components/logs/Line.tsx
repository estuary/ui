/* eslint-disable react/jsx-no-useless-fragment */
import { ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import type { AnsiColored } from 'ansicolor';
import Ansi from 'ansicolor';
import { defaultOutline } from 'context/Theme';
import { useMemo } from 'react';
import type { ViewLogs_Line } from 'types';
import LinePart from './LinePart';

interface Props {
    line: ViewLogs_Line | string;
    lineNumber: number | string | any;
    disableBorder?: boolean;
    disableSelect?: boolean;
}

export const lineNumberColor = '#666';

// const parseStream = (line: ViewLogs_Line): ParsedStream => {
//     return line.stream.slice(0, line.stream.lastIndexOf(':')) as ParsedStream;
// };

function LogLine({ line, lineNumber, disableBorder, disableSelect }: Props) {
    let parsedLine: AnsiColored;

    if (line instanceof Object) {
        parsedLine = Ansi.parse(line.log_line);
    } else {
        parsedLine = Ansi.parse(line);
    }

    const reneredParsedLine = useMemo(() => {
        return parsedLine.spans.map((span, index, array) => (
            <LinePart
                key={`logs-linePart-${lineNumber}__${index}`}
                parsedLine={span}
                lastPart={index + 1 === array.length}
            />
        ));
    }, [lineNumber, parsedLine.spans]);

    return (
        <ListItem
            alignItems="flex-start"
            sx={{
                'borderBottom': disableBorder
                    ? undefined
                    : (theme) => defaultOutline[theme.palette.mode],
                'py': 0.5,
                'whiteSpace': 'normal',
                'userSelect': disableSelect ? 'none' : undefined,
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
                    display: 'inline-block',
                    wordWrap: 'break-word',
                    flexWrap: 'wrap',
                }}
            >
                {reneredParsedLine}
            </ListItemText>
        </ListItem>
    );
}

export default LogLine;

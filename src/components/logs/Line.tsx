/* eslint-disable react/jsx-no-useless-fragment */
import { ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { parse } from 'ansicolor';
import { defaultOutline } from 'context/Theme';
import { useMemo } from 'react';
import { ViewLogs_Line } from 'types';
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
                    key={`logs-linePart-${lineNumber}__${index}`}
                    parsedLine={span}
                    lastPart={index + 1 === array.length}
                />
            )
        );
    }, [lineNumber, parsedLine.spans]);

    return (
        <ListItem
            alignItems="flex-start"
            sx={{
                'borderBottom': disableBorder
                    ? undefined
                    : (theme) => defaultOutline[theme.palette.mode],
                'userSelect': disableSelect ? 'none' : undefined,
                'py': 0.5,
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
        </ListItem>
    );
}

export default LogLine;

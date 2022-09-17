import { Box, ListItem, Stack } from '@mui/material';
import { parse } from 'ansicolor';
import LinePart from './LinePart';

interface Props {
    line: any;
    lineNumber: number | string | any;
}

function LogLine({ line, lineNumber }: Props) {
    const parsedLine = parse(line.log_line);

    return (
        <ListItem
            sx={{
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
                        color: '#666',
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

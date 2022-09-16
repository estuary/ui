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
                    background: 'red',
                },
            }}
        >
            <Stack
                direction="row"
                spacing={2}
                sx={{
                    alignItems: 'center',
                    flexGrow: 1,
                }}
            >
                <Box
                    sx={{
                        userSelect: 'none',
                        minWidth: 50,
                        textAlign: 'right',
                    }}
                >
                    {lineNumber}
                </Box>
                {parsedLine.spans.map((span, index) => (
                    <LinePart
                        key={`${span.text}-linePart-${index}`}
                        parsedLine={span}
                    />
                ))}
            </Stack>
        </ListItem>
    );
}

export default LogLine;

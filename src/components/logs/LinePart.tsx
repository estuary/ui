import { ListItemText, styled } from '@mui/material';
import { ParsedSpan } from 'ansicolor';
import { useMemo } from 'react';
import { unescapeString } from 'utils/misc-utils';

interface Props {
    parsedLine: ParsedSpan;
    lastPart?: boolean;
}

function LinePart({ parsedLine, lastPart }: Props) {
    const StyledLogLinePart = styled('span')(parsedLine.css);

    const splitTextLines = parsedLine.text.split('\\n');

    const linePartRendered = useMemo(() => {
        return (
            <>
                {splitTextLines.map((lineText, index) => {
                    const formattedLine = unescapeString(
                        lastPart ? lineText.trimEnd() : lineText
                    );

                    return (
                        <ListItemText
                            key={`${lineText} - linePart - ${index}`}
                            primary={formattedLine}
                            disableTypography
                        />
                    );
                })}
            </>
        );
    }, [lastPart, splitTextLines]);

    return (
        <StyledLogLinePart
            sx={{
                '& .MuiListItemText-root + .MuiListItemText-root': {
                    pl: 3,
                },
            }}
        >
            {linePartRendered}
        </StyledLogLinePart>
    );
}

export default LinePart;

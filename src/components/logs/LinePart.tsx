import { styled } from '@mui/material';
import { ParsedSpan } from 'ansicolor';
import { unescapeString } from 'utils/misc-utils';

interface Props {
    parsedLine: ParsedSpan;
    lastPart?: boolean;
}

function LinePart({ parsedLine, lastPart }: Props) {
    const StyledLogLinePart = styled('span')(parsedLine.css);

    const splitTextLines = parsedLine.text.split('\\n');

    return (
        <StyledLogLinePart
            sx={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
        >
            {splitTextLines.map((lineText) => {
                const formattedLine = unescapeString(
                    lastPart ? lineText.trimEnd() : lineText
                );

                return formattedLine;
            })}
        </StyledLogLinePart>
    );
}

export default LinePart;

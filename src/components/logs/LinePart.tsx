import type { ParsedSpan } from 'ansicolor';

import { styled } from '@mui/material';

import { unescapeString } from 'src/utils/misc-utils';

interface Props {
    parsedLine: ParsedSpan;
    lastPart?: boolean;
}

const BaseLogLinePart = styled('span')({
    wordWrap: 'break-word',
    wordbreak: 'break-all',
});

function LinePart({ parsedLine, lastPart }: Props) {
    const StyledLogLinePart = styled(BaseLogLinePart)(parsedLine.css);

    const splitTextLines = parsedLine.text.split('\\n');

    return (
        <StyledLogLinePart>
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

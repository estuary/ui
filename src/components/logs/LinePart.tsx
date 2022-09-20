import { ParsedSpan } from 'ansicolor';
import { ListItemText, styled } from '@mui/material';

interface Props {
    parsedLine: ParsedSpan;
    lastPart?: boolean;
}

function LinePart({ parsedLine, lastPart }: Props) {
    const StyledLogLinePart = styled('span')(parsedLine.css);

    return (
        <StyledLogLinePart>
            <ListItemText
                primary={lastPart ? parsedLine.text.trimEnd() : parsedLine.text}
                disableTypography
            />
        </StyledLogLinePart>
    );
}

export default LinePart;

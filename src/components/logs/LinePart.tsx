import { ParsedSpan } from 'ansicolor';
import { ListItemText, styled } from '@mui/material';

interface Props {
    parsedLine: ParsedSpan;
}

function LinePart({ parsedLine }: Props) {
    const StyledLogLinePart = styled('span')(parsedLine.css);

    return (
        <StyledLogLinePart>
            <ListItemText primary={parsedLine.text} />
        </StyledLogLinePart>
    );
}

export default LinePart;

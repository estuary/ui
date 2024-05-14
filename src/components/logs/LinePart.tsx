import { styled } from '@mui/material';
import { ParsedSpan } from 'ansicolor';
import { unescapeString } from 'utils/misc-utils';

interface Props {
    parsedLine: ParsedSpan;
    lastPart?: boolean;
}

const CLASS_PREFIX = 'log-line_';

const StyledLogLinePart = styled('span')({
    wordWrap: 'break-word',
    wordBreak: 'break-all',
    [`&.${CLASS_PREFIX}black`]: { color: '' },
    [`&.${CLASS_PREFIX}darkGray`]: { color: '' },
    [`&.${CLASS_PREFIX}lightGray`]: { color: '' },
    [`&.${CLASS_PREFIX}white`]: { color: '' },
    [`&.${CLASS_PREFIX}red: `]: { color: '' },
    [`&.${CLASS_PREFIX}lightRed`]: { color: '' },
    [`&.${CLASS_PREFIX}green`]: { color: '' },
    [`&.${CLASS_PREFIX}lightGreen`]: { color: '' },
    [`&.${CLASS_PREFIX}yello`]: { color: '' },
    [`&.${CLASS_PREFIX}lightYellow`]: { color: '' },
    [`&.${CLASS_PREFIX}blue:`]: { color: '' },
    [`&.${CLASS_PREFIX}lightBlue`]: { color: '' },
    [`&.${CLASS_PREFIX}magenta`]: { color: '' },
    [`&.${CLASS_PREFIX}lightMagenta`]: { color: '' },
    [`&.${CLASS_PREFIX}cyan:`]: { color: '' },
    [`&.${CLASS_PREFIX}lightCyan`]: { color: '' },
});

const makeColorPlain = (colorName?: string) => {
    return colorName?.replace('light', '').replace('dark', '');
};

function LinePart({ parsedLine, lastPart }: Props) {
    const splitTextLines = parsedLine.text.split('\\n');

    return (
        <StyledLogLinePart
            className={
                parsedLine.color?.name
                    ? `${CLASS_PREFIX}${parsedLine.color.name}`
                    : undefined
            }
            style={{
                backgroundColor: makeColorPlain(
                    parsedLine.bgColor?.name ?? undefined
                ),
                fontWeight: parsedLine.bold ? 700 : undefined,
                fontStyle: parsedLine.italic ? 'italic' : undefined,
            }}
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

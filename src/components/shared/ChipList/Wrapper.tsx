import { Box, Chip as MuiChip, styled, Tooltip } from '@mui/material';
import { defaultOutline } from 'context/Theme';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { stripPathing } from 'utils/misc-utils';
import LinkWrapper from '../LinkWrapper';

export interface ChipDisplay {
    display: string;
    link?: string;
    title?: string;
}

interface Props {
    onClick?: () => void;
    disabled?: boolean;
    stripPath?: boolean;
    title?: string;
    val: ChipDisplay;
}

const ListItem = styled('li')(({ theme }) => ({
    margin: theme.spacing(0.5),
}));
const chipListHoverStyling = {
    cursor: 'pointer',
};

function ChipWrapper({ disabled, onClick, stripPath, title, val }: Props) {
    const intl = useIntl();
    const displayValue = stripPath
        ? intl.formatMessage(
              {
                  id: 'commin.pathShort.prefix',
              },
              {
                  path: stripPathing(val.display),
              }
          )
        : val.display;

    // Save off the Chip so we can more easily wrap in a link if needed
    const chip = useMemo(() => {
        return (
            <MuiChip
                label={displayValue}
                size="small"
                variant="outlined"
                disabled={disabled}
                onClick={onClick}
                sx={{
                    'maxWidth': 200,
                    'border': (theme) => defaultOutline[theme.palette.mode],
                    // TODO (typing) Figure out how to use truncateTextSx here
                    'whiteSpace': 'nowrap',
                    'overflow': 'hidden',
                    'textOverflow': 'ellipsis',
                    '&:hover': {
                        ...chipListHoverStyling,
                        background: (hoverTheme) =>
                            hoverTheme.palette.background.default,
                    },
                }}
            />
        );
    }, [disabled, displayValue, onClick]);

    // Set what we should display in the tooltip
    const tooltipTitle = useMemo(() => {
        if (val.title) {
            return val.title;
        }

        return title ?? displayValue;
    }, [displayValue, title, val.title]);

    return (
        <ListItem>
            <Tooltip
                title={tooltipTitle}
                disableFocusListener={!stripPath}
                disableHoverListener={!stripPath}
                disableTouchListener={!stripPath}
            >
                {val.link ? (
                    <Box>
                        <LinkWrapper link={val.link}>{chip}</LinkWrapper>
                    </Box>
                ) : (
                    chip
                )}
            </Tooltip>
        </ListItem>
    );
}

export default ChipWrapper;

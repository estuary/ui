import {
    Box,
    Chip as MuiChip,
    styled,
    SxProps,
    Theme,
    Tooltip,
} from '@mui/material';
import { defaultOutline, underlineTextSx } from 'context/Theme';
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

    // Set what we should display in the tooltip
    const tooltipTitle = useMemo(() => {
        if (val.title) {
            return val.title;
        }

        return title ?? displayValue;
    }, [displayValue, title, val.title]);

    // Save off the Chip so we can more easily wrap in a link if needed
    const chip = useMemo(() => {
        let chipSX: SxProps<Theme> = {
            // TODO (typing) Figure out how to use truncateTextSx here
            'whiteSpace': 'nowrap',
            'overflow': 'hidden',
            'textOverflow': 'ellipsis',
            'maxWidth': 200,
            'border': (theme) => defaultOutline[theme.palette.mode],

            '&:hover': {
                ...chipListHoverStyling,
                background: (hoverTheme) =>
                    hoverTheme.palette.background.default,
            },
        };

        if (val.link) {
            chipSX = {
                ...chipSX,
                ...underlineTextSx,
                color: (theme) => theme.palette.primary.main,
            };
        }

        return (
            <MuiChip
                component="span"
                label={displayValue}
                size="small"
                variant="outlined"
                disabled={disabled}
                onClick={onClick}
                sx={chipSX}
            />
        );
    }, [disabled, displayValue, onClick, val.link]);

    const wrappedChip = useMemo(() => {
        if (val.link) {
            return <LinkWrapper link={val.link}>{chip}</LinkWrapper>;
        }
        return chip;
    }, [chip, val.link]);

    return (
        <ListItem>
            <Tooltip
                title={tooltipTitle}
                disableFocusListener={!stripPath}
                disableHoverListener={!stripPath}
                disableTouchListener={!stripPath}
            >
                <Box>{wrappedChip}</Box>
            </Tooltip>
        </ListItem>
    );
}

export default ChipWrapper;

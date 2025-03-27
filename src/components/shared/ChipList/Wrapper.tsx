import type { SxProps, Theme } from '@mui/material';
import type { ChipWrapperProps } from 'src/components/shared/ChipList/types';

import { useMemo } from 'react';

import { Box, Chip as MuiChip, styled, Tooltip } from '@mui/material';

import { useIntl } from 'react-intl';

import LinkWrapper from 'src/components/shared/LinkWrapper';
import { defaultOutline, underlineTextSx } from 'src/context/Theme';
import { stripPathing } from 'src/utils/misc-utils';

const ListItem = styled('li')(({ theme }) => ({
    margin: theme.spacing(0.5),
}));
const chipListHoverStyling = {
    cursor: 'pointer',
};

function ChipWrapper({
    disabled,
    onClick,
    stripPath,
    title,
    val,
}: ChipWrapperProps) {
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
                onClick={
                    onClick
                        ? (event) => {
                              event.stopPropagation();
                              event.preventDefault();
                              onClick();
                          }
                        : undefined
                }
                sx={chipSX}
            />
        );
    }, [disabled, displayValue, onClick, val.link]);

    const wrappedChip = useMemo(() => {
        if (val.link) {
            return (
                <LinkWrapper link={val.link} newWindow={val.newWindow}>
                    {chip}
                </LinkWrapper>
            );
        }
        return chip;
    }, [chip, val.link, val.newWindow]);

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

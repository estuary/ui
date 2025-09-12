import type { SxProps, Theme } from '@mui/material';
import type { ChipWrapperProps } from 'src/components/shared/ChipList/types';

import { useMemo } from 'react';

import { Box, styled, Tooltip } from '@mui/material';

import { useIntl } from 'react-intl';

import LinkWrapper from 'src/components/shared/LinkWrapper';
import { underlineTextSx } from 'src/context/Theme';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';
import { stripPathing } from 'src/utils/misc-utils';

const ListItem = styled('li')(({ theme }) => ({
    margin: theme.spacing(0.5),
}));

function ChipWrapper({
    disabled,
    forceTooltip,
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
            maxWidth: 200,
            // TODO (typing) Figure out how to use truncateTextSx here
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        };

        if (val.link) {
            chipSX = {
                ...chipSX,
                ...underlineTextSx,
                color: (theme) => theme.palette.primary.main,
            };
        }

        return (
            <OutlinedChip
                component="span"
                disabled={disabled}
                label={displayValue}
                onClick={
                    onClick
                        ? (event) => {
                              event.stopPropagation();
                              event.preventDefault();
                              onClick();
                          }
                        : undefined
                }
                size="small"
                sx={chipSX}
                variant="outlined"
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

    const disableTooltip = forceTooltip ? false : !stripPath;

    return (
        <ListItem>
            <Tooltip
                title={tooltipTitle}
                disableFocusListener={disableTooltip}
                disableHoverListener={disableTooltip}
                disableTouchListener={disableTooltip}
            >
                <Box>{wrappedChip}</Box>
            </Tooltip>
        </ListItem>
    );
}

export default ChipWrapper;

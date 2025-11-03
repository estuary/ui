import type { ChipListProps } from 'src/components/shared/ChipList/types';

import { useMemo } from 'react';

import { Box, ListItem, useTheme } from '@mui/material';

import ChipWrapper from 'src/components/shared/ChipList/Wrapper';
import { ExpandListChip } from 'src/styledComponents/chips/ExpandListChip';
import { useCollapsableList } from 'src/styledComponents/chips/useCollapsableList';

function ChipList({
    values,
    disabled,
    forceTooltip,
    maxChips,
    stripPath,
    sx,
}: ChipListProps) {
    const theme = useTheme();

    // Format data coming in so we can still pass in a list of strings
    const formattedValues = useMemo(() => {
        return values.map((value) => {
            return typeof value === 'string'
                ? {
                      display: value,
                  }
                : value;
        });
    }, [values]);

    const { hiddenCount, list, listScroller, showEntireList } =
        useCollapsableList(formattedValues, maxChips);

    return (
        <Box
            ref={listScroller}
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                listStyle: 'none',
                alignItems: 'center',
                p: 0,
                m: 0,
                minWidth: 100,
                maxHeight: 100,
                overflow: 'auto',
                ...sx,
            }}
            component="ul"
        >
            {list.map((el, index) => {
                return (
                    <ChipWrapper
                        val={el}
                        key={`chipList_${el.display}-${index}`}
                        disabled={disabled}
                        stripPath={stripPath ?? true}
                        forceTooltip={forceTooltip ?? false}
                    />
                );
            })}

            <ListItem
                style={{
                    margin: theme.spacing(0.5),
                    padding: 0,
                    width: 'fit-content',
                }}
            >
                <ExpandListChip
                    component="span"
                    hiddenCount={hiddenCount}
                    showEntireList={showEntireList}
                />
            </ListItem>
        </Box>
    );
}

export default ChipList;

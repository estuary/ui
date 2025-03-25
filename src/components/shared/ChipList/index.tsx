import type { ChipListProps } from './types';
import { Box } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import ChipWrapper from './Wrapper';

function ChipList({
    values,
    disabled,
    maxChips,
    stripPath,
    sx,
}: ChipListProps) {
    const intl = useIntl();

    const listScroller = useRef<HTMLDivElement>(null);

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
    const valueLength = useMemo(
        () => formattedValues.length,
        [formattedValues]
    );
    const [maxRender, setMaxRender] = useState(maxChips ?? valueLength);

    // See how many values are hidden
    const hiddenCount = useMemo(() => {
        return valueLength - maxRender;
    }, [maxRender, valueLength]);

    // Slice off the right number of values to display
    const renderList = useMemo(() => {
        return formattedValues.slice(0, maxRender);
    }, [maxRender, formattedValues]);

    const showEntireList = () => {
        setMaxRender(valueLength);
    };

    // When all chips are shown scroll down just a hair to try to make
    //   sure the user knows that the list is scrollable
    useEffect(() => {
        if (!listScroller.current || maxRender !== valueLength) {
            return;
        }

        listScroller.current.scrollTop += 20;
    }, [maxRender, valueLength]);

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
            {renderList.map((val, index) => {
                return (
                    <ChipWrapper
                        val={val}
                        key={`chipList_${val.display}-${index}`}
                        disabled={disabled}
                        stripPath={stripPath ?? true}
                    />
                );
            })}
            {hiddenCount > 0 ? (
                <ChipWrapper
                    val={{
                        display: intl.formatMessage(
                            { id: 'entityTable.moreEntities' },
                            {
                                count: hiddenCount,
                            }
                        ),
                    }}
                    onClick={showEntireList}
                    title={intl.formatMessage({ id: 'cta.showAll' })}
                />
            ) : null}
        </Box>
    );
}

export default ChipList;

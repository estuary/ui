import { Box } from '@mui/material';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { ChipListProps } from './types';
import ChipWrapper from './Wrapper';

function ChipList({
    values,
    disabled,
    maxChips,
    stripPath,
    onClick,
}: ChipListProps) {
    const intl = useIntl();

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

    return (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                listStyle: 'none',
                p: 0,
                m: 0,
                minWidth: 100,
                overflow: 'auto',
                maxHeight: 100,
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
                        onClick={onClick}
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

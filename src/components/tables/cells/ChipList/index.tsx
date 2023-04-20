import { Box, TableCell } from '@mui/material';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import ChipWrapper from './Wrapper';

interface Props {
    strings: string[];
    disabled?: boolean;
    maxChips?: number;
    stripPath?: boolean;
}

function ChipList({ strings, disabled, maxChips, stripPath }: Props) {
    const intl = useIntl();

    const [maxRender, setMaxRender] = useState(maxChips ?? strings.length);

    const stringsHidden = useMemo(() => {
        return strings.length - maxRender;
    }, [maxRender, strings.length]);

    const stringsToRender = useMemo(() => {
        return strings.slice(0, maxRender);
    }, [maxRender, strings]);

    const showEntireList = () => {
        setMaxRender(strings.length);
    };

    return (
        <TableCell>
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
                {stringsToRender.map((val, index) => {
                    return (
                        <ChipWrapper
                            val={val}
                            key={`${val}-${index}`}
                            disabled={disabled}
                            stripPath={stripPath ?? true}
                        />
                    );
                })}
                {stringsHidden > 0 ? (
                    <ChipWrapper
                        val={intl.formatMessage(
                            { id: 'entityTable.moreEntities' },
                            {
                                count: stringsHidden,
                            }
                        )}
                        onClick={showEntireList}
                        title={intl.formatMessage({ id: 'cta.showAll' })}
                    />
                ) : null}
            </Box>
        </TableCell>
    );
}

export default ChipList;

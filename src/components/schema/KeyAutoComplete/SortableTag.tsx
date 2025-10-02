import type { ChipProps } from '@mui/material';

import { Box, IconButton, Tooltip } from '@mui/material';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreVert } from 'iconoir-react';
import { useIntl } from 'react-intl';

import { truncateTextSx } from 'src/context/Theme';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

interface Props {
    tagProps: Partial<ChipProps>;
    label: string;
    validOption: boolean;
}

function SortableTag({ tagProps, label, validOption }: Props) {
    const intl = useIntl();
    const {
        attributes,
        listeners,
        setActivatorNodeRef,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: label });

    const style = {
        opacity: isDragging ? 0.33 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <Box
            component="span"
            id={label}
            ref={setNodeRef}
            style={style}
            sx={{
                ...truncateTextSx,
                maxWidth: 300,
            }}
            {...attributes}
        >
            {validOption ? (
                <OutlinedChip
                    {...tagProps}
                    icon={
                        <IconButton
                            ref={setActivatorNodeRef}
                            {...listeners}
                            size="small"
                        >
                            <MoreVert />
                        </IconButton>
                    }
                    label={label}
                    variant="outlined"
                />
            ) : (
                // <StyledChip
                //     componentProps={{
                //         chip: tagProps,
                //         icon: {
                //             ref: setActivatorNodeRef,
                //             ...listeners,
                //         },
                //     }}
                //     label={label}
                // />
                <Tooltip
                    title={intl.formatMessage({
                        id: 'keyAutoComplete.keys.invalid.message',
                    })}
                >
                    <Box>
                        <OutlinedChip
                            {...tagProps}
                            color="error"
                            icon={
                                <IconButton
                                    ref={setActivatorNodeRef}
                                    {...listeners}
                                    size="small"
                                >
                                    <MoreVert />
                                </IconButton>
                            }
                            label={label}
                            variant="outlined"
                        />
                    </Box>
                </Tooltip>
            )}
        </Box>
    );
}

export default SortableTag;

import type { ChipProps } from '@mui/material';

import { Box, Tooltip } from '@mui/material';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useIntl } from 'react-intl';

import StyledChip from 'src/components/schema/KeyAutoComplete/StyledChip';
import { truncateTextSx } from 'src/context/Theme';

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
                // <OutlinedChip
                //     {...tagProps}
                //     icon={
                //         <IconButton
                //             ref={setActivatorNodeRef}
                //             {...listeners}
                //             size="small"
                //         >
                //             <MoreVert />
                //         </IconButton>
                //     }
                //     label={label}
                //     variant="outlined"
                // />
                <StyledChip
                    componentProps={{
                        chip: tagProps,
                        icon: {
                            ref: setActivatorNodeRef,
                            ...listeners,
                        },
                    }}
                    label={label}
                />
            ) : (
                <Tooltip
                    title={intl.formatMessage({
                        id: 'keyAutoComplete.keys.invalid.message',
                    })}
                >
                    <Box>
                        <StyledChip
                            componentProps={{
                                chip: {
                                    ...tagProps,
                                    color: 'error',
                                },
                                icon: {
                                    ref: setActivatorNodeRef,
                                    ...listeners,
                                },
                            }}
                            label={label}
                        />
                    </Box>
                </Tooltip>
            )}
        </Box>
    );
}

export default SortableTag;

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, ChipProps, Tooltip } from '@mui/material';
import { truncateTextSx } from 'context/Theme';
import { useIntl } from 'react-intl';
import StyledChip from './StyledChip';

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

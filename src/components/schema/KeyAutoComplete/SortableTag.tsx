import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Tooltip } from '@mui/material';
import { useIntl } from 'react-intl';
import StyledChip from './StyledChip';

interface Props {
    tagProps: any;
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
        opacity: isDragging ? 0 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <Box
            component="span"
            id={label}
            ref={setNodeRef}
            style={style}
            {...attributes}
        >
            <Tooltip
                disableInteractive={validOption}
                disableFocusListener={validOption}
                disableHoverListener={validOption}
                disableTouchListener={validOption}
                title={
                    !validOption
                        ? intl.formatMessage({
                              id: 'data.key.errors.invalidKey',
                          })
                        : undefined
                }
            >
                <StyledChip
                    color={validOption ? 'default' : 'error'}
                    componentProps={{
                        chip: tagProps,
                        icon: {
                            ref: setActivatorNodeRef,
                            ...listeners,
                        },
                    }}
                    label={label}
                />
            </Tooltip>
        </Box>
    );
}

export default SortableTag;

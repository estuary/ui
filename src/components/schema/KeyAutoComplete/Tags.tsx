import {
    closestCenter,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Box, Chip, Tooltip } from '@mui/material';
import { useState } from 'react';
import { useIntl } from 'react-intl';

interface Props {
    getTagProps: any;
    onOrderChange: (newList: any) => void;
    ownerState: any;
    values: any;
}

function Tags({ getTagProps, onOrderChange, ownerState, values }: Props) {
    const intl = useIntl();

    const [activeId, setActiveId] = useState(null);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragStart(event: any) {
        const { active } = event;

        setActiveId(active.id);
    }

    function handleDragEnd(event: any) {
        const { active, over } = event;

        if (active.id !== over.id) {
            onOrderChange((items: any) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }

        setActiveId(null);
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={values}
                strategy={horizontalListSortingStrategy}
            >
                {values.map((tagValue: any, tagValueIndex: number) => {
                    const tagProps = getTagProps({ index: tagValueIndex });

                    const validOption = ownerState.options.includes(tagValue);

                    return (
                        <Box
                            id={tagValue}
                            key={`autocomplete-selected-tag-${tagValue}`}
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
                                <Chip
                                    {...tagProps}
                                    label={tagValue}
                                    sx={{
                                        bgcolor: (theme) =>
                                            validOption
                                                ? undefined
                                                : theme.palette.error.main,
                                    }}
                                />
                            </Tooltip>
                        </Box>
                    );
                })}
            </SortableContext>
            {/*eslint-disable-next-line @typescript-eslint/no-unnecessary-condition*/}
            <DragOverlay>{activeId ? <Box id={activeId} /> : null}</DragOverlay>
        </DndContext>
    );
}

export default Tags;

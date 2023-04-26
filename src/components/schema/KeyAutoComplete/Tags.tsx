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
import { Chip } from '@mui/material';
import DraggableWrapper from 'components/shared/DragAndDrop/DraggableWrapper';
import { useState } from 'react';
import Tag from './Tag';

interface Props {
    getTagProps: any;
    onOrderChange: (newList: any) => void;
    ownerState: any;
    values: any;
}

function Tags({ getTagProps, onOrderChange, ownerState, values }: Props) {
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
                {values.map((tagValue: any, tagValueIndex: number) => (
                    <DraggableWrapper
                        id={tagValue}
                        key={`autocomplete-selected-tag-${tagValue}`}
                    >
                        <Tag
                            tagProps={getTagProps({ index: tagValueIndex })}
                            value={tagValue}
                            validOption={ownerState.options.includes(tagValue)}
                        />
                    </DraggableWrapper>
                ))}
            </SortableContext>
            <DragOverlay>
                {/*eslint-disable-next-line @typescript-eslint/no-unnecessary-condition*/}
                {activeId ? <Chip id={activeId} title={activeId} /> : null}
            </DragOverlay>
        </DndContext>
    );
}

export default Tags;

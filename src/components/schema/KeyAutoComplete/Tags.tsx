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
    horizontalListSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Chip } from '@mui/material';
import SortableWrapper from 'components/shared/DragAndDrop/SortableWrapper';
import { useState } from 'react';
import Tag from './Tag';

interface Props {
    getTagProps: any;
    onOrderChange: (activeId: string, overId: string) => void;
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

        console.log('schemaEditor:key:drag:start', event);

        setActiveId(active.id);
    }

    function handleDragEnd(event: any) {
        const { active, over } = event;

        console.log('schemaEditor:key:drag:end');

        if (active.id !== over.id) {
            onOrderChange(active.id, over.id);
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
                    <SortableWrapper
                        id={tagValue}
                        key={`autocomplete-selected-tag-${tagValue}`}
                    >
                        <Tag
                            tagProps={getTagProps({ index: tagValueIndex })}
                            value={tagValue}
                            validOption={ownerState.options.includes(tagValue)}
                        />
                    </SortableWrapper>
                ))}
            </SortableContext>
            <DragOverlay>
                {/*eslint-disable-next-line @typescript-eslint/no-unnecessary-condition*/}
                {activeId ? (
                    <Chip
                        id={activeId}
                        title={activeId}
                        sx={{ cursor: 'grabbed' }}
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

export default Tags;

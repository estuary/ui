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
    restrictToFirstScrollableAncestor,
    restrictToParentElement,
} from '@dnd-kit/modifiers';
import {
    horizontalListSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import SortableTag from './SortableTag';
import StyledChip from './StyledChip';

interface Props {
    getTagProps: any;
    onOrderChange: (activeId: string, overId: string) => void;
    ownerState: any;
    values: any;
}

function SortableTags({
    getTagProps,
    onOrderChange,
    ownerState,
    values,
}: Props) {
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
            modifiers={[restrictToParentElement]}
        >
            <SortableContext
                items={values}
                strategy={horizontalListSortingStrategy}
            >
                {values.map((tagValue: any, tagValueIndex: number) => (
                    <SortableTag
                        key={`autocomplete-selected-tag-${tagValue}`}
                        label={tagValue}
                        tagProps={getTagProps({ index: tagValueIndex })}
                        validOption={ownerState.options.includes(tagValue)}
                    />
                ))}
            </SortableContext>
            <DragOverlay modifiers={[restrictToFirstScrollableAncestor]}>
                {/*eslint-disable-next-line @typescript-eslint/no-unnecessary-condition*/}
                {activeId ? (
                    <StyledChip id={activeId} label={activeId} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

export default SortableTags;

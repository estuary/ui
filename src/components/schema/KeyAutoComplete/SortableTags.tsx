import {
    closestCenter,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    UniqueIdentifier,
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
import { AutocompleteGetTagProps } from '@mui/material';
import { useState } from 'react';
import SortableTag from './SortableTag';
import StyledChip from './StyledChip';

interface Props {
    getTagProps: AutocompleteGetTagProps;
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
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToParentElement]}
            sensors={sensors}
            onDragStart={(event) => {
                const { active } = event;

                setActiveId(active.id);
            }}
            onDragEnd={(event) => {
                const { active, over } = event;

                if (over && active.id !== over.id) {
                    onOrderChange(active.id as string, over.id as string);
                }

                setActiveId(null);
            }}
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
                    <StyledChip id={activeId as string} label={activeId} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

export default SortableTags;

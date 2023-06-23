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
import { useMemo, useState } from 'react';
import { keyIsValidOption } from './shared';
import SortableTag from './SortableTag';
import StyledChip from './StyledChip';

interface Props {
    getTagProps: AutocompleteGetTagProps;
    onOrderChange: (activeId: string, overId: string) => PromiseLike<any>;
    ownerState: any;
    values: any;
    validateOptions?: boolean;
}

function SortableTags({
    getTagProps,
    onOrderChange,
    ownerState,
    values,
    validateOptions,
}: Props) {
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const renderedTags = useMemo(() => {
        return values.map((tagValue: any, tagValueIndex: number) => (
            <SortableTag
                key={`autocomplete-selected-tag-${tagValue}`}
                label={tagValue}
                tagProps={getTagProps({ index: tagValueIndex })}
                validOption={
                    validateOptions
                        ? keyIsValidOption(ownerState.options, tagValue)
                        : true
                }
            />
        ));
    }, [getTagProps, ownerState.options, validateOptions, values]);

    return (
        <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToParentElement]}
            sensors={sensors}
            onDragStart={(event) => {
                const { active } = event;

                setActiveId(active.id);
            }}
            onDragEnd={async (event) => {
                const { active, over } = event;

                if (over && active.id !== over.id) {
                    await onOrderChange(active.id as string, over.id as string);
                }

                setActiveId(null);
            }}
        >
            <SortableContext
                items={values}
                strategy={horizontalListSortingStrategy}
            >
                {renderedTags}
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

import { useDraggable } from '@dnd-kit/core';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    id: string;
}

function DraggableWrapper({ children, id }: Props) {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id,
    });

    return (
        <span ref={setNodeRef} {...listeners} {...attributes}>
            {children}
        </span>
    );
}

export default DraggableWrapper;

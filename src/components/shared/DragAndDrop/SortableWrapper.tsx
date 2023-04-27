import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    id: string;
}

function SortableWrapper({ children, id }: Props) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <span
            id={id}
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >
            {children}
        </span>
    );
}

export default SortableWrapper;

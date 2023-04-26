import { useSortable } from '@dnd-kit/sortable';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    id: string;
}

function SortableWrapper({ children, id }: Props) {
    const { attributes, listeners, setNodeRef } = useSortable({ id });

    return (
        <span id={id} ref={setNodeRef} {...attributes} {...listeners}>
            {children}
        </span>
    );
}

export default SortableWrapper;

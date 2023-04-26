import { useDraggable } from '@dnd-kit/core';
import { Box } from '@mui/material';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    id: string;
}

function DraggableWrapper({ children, id }: Props) {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id,
    });

    console.log('DraggableWrapper attributes', attributes);

    return (
        <Box
            ref={setNodeRef}
            sx={{ cursor: 'grab' }}
            {...listeners}
            {...attributes}
        >
            {children}
        </Box>
    );
}

export default DraggableWrapper;

import type { EditorResizeWrapperProps } from 'src/components/editor/types';

import { Box } from '@mui/material';

// TODO (monaco resize)
// This is required so that when the List is resized super small the
//  editor does not start growing. Weird that this is not happening with
//  the DiffEditor in the History component
//  or
//  The alerting in ui/src/components/shared/Entity/Details/Alerts/Details/ServerError.tsx
export function EditorResizeWrapper({
    editorHeight,
    children,
}: EditorResizeWrapperProps) {
    return (
        <Box
            style={{
                height: `${editorHeight}px`,
                position: 'relative',
                width: '100%',
            }}
        >
            <Box
                style={{
                    inset: 0,
                    overflow: 'hidden',
                    position: 'absolute',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}

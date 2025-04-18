import { Box, Skeleton } from '@mui/material';

import {
    defaultOutline,
    monacoEditorHeaderBackground,
    monacoEditorWidgetBackground,
} from 'src/context/Theme';
import {
    DEFAULT_HEIGHT,
    DEFAULT_TOOLBAR_HEIGHT,
    getEditorTotalHeight,
} from 'src/utils/editor-utils';

interface JsonSchemaSkeletonProps {
    opacity?: number;
    padding?: number;
}

function JsonSchemaSkeleton({ opacity, padding }: JsonSchemaSkeletonProps) {
    return (
        <Box sx={{ p: padding ?? 1, opacity }}>
            <Skeleton variant="rectangular" width={50} sx={{ mb: 1 }} />

            <Skeleton variant="rectangular" width={250} sx={{ mb: 1 }} />

            <Skeleton variant="rectangular" width={300} sx={{ mb: 1 }} />

            <Skeleton variant="rectangular" width={350} sx={{ mb: 1 }} />

            <Skeleton variant="rectangular" width={300} sx={{ mb: 1 }} />

            <Skeleton variant="rectangular" width={250} sx={{ mb: 1 }} />

            <Skeleton variant="rectangular" width={50} />
        </Box>
    );
}

interface MonacoEditorSkeletonProps {
    editorHeight?: number;
    toolbarHeight?: number;
    customTotalHeight?: number;
}

function MonacoEditorSkeleton({
    editorHeight = DEFAULT_HEIGHT,
    toolbarHeight = DEFAULT_TOOLBAR_HEIGHT,
    customTotalHeight,
}: MonacoEditorSkeletonProps) {
    const totalHeight =
        customTotalHeight ?? getEditorTotalHeight(editorHeight, toolbarHeight);

    return (
        <Box
            sx={{
                height: totalHeight,
                border: (theme) => defaultOutline[theme.palette.mode],
            }}
        >
            <Box
                sx={{
                    minHeight: toolbarHeight,
                    backgroundColor: (theme) =>
                        monacoEditorHeaderBackground[theme.palette.mode],
                    borderBottom: (theme) => defaultOutline[theme.palette.mode],
                }}
            />

            <Box
                sx={{
                    height: editorHeight,
                    p: 1,
                    backgroundColor: (theme) =>
                        monacoEditorWidgetBackground[theme.palette.mode],
                }}
            >
                <JsonSchemaSkeleton />
            </Box>
        </Box>
    );
}

export { JsonSchemaSkeleton, MonacoEditorSkeleton };

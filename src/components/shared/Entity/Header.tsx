import {
    Collapse,
    LinearProgress,
    Stack,
    SxProps,
    Theme,
    Toolbar,
} from '@mui/material';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import { ReactNode } from 'react';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';

interface Props {
    GenerateButton: ReactNode;
    SaveButton: ReactNode;
    TestButton: ReactNode;
}

export const buttonSx: SxProps<Theme> = { ml: 1 };

function EntityToolbar({ GenerateButton, TestButton, SaveButton }: Props) {
    // Editor Store
    const draftId = useEditorStore_id();

    // Form State Store
    const formActive = useFormStateStore_isActive();

    return (
        <Stack spacing={2} sx={{ mb: 1 }}>
            <Toolbar disableGutters>
                <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                        'ml': 'auto',
                        '& > button': {
                            // TODO (theme) make this use truncateTextSx
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                        },
                    }}
                >
                    {draftId ? (
                        <>
                            {TestButton}

                            {SaveButton}
                        </>
                    ) : (
                        GenerateButton
                    )}
                </Stack>
            </Toolbar>

            <Collapse in={formActive} unmountOnExit>
                <LinearProgress />
            </Collapse>
        </Stack>
    );
}

export default EntityToolbar;

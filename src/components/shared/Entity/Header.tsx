import {
    Collapse,
    LinearProgress,
    Stack,
    SxProps,
    Theme,
    Toolbar,
} from '@mui/material';
import { ReactNode } from 'react';
import { useFormStateStore_isActive } from 'stores/FormState';

interface Props {
    GenerateButton: ReactNode;
    TestButton: ReactNode;
    SaveButton: ReactNode;
}

export const buttonSx: SxProps<Theme> = { ml: 1 };

function EntityToolbar({ GenerateButton, TestButton, SaveButton }: Props) {
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
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                        },
                    }}
                >
                    {GenerateButton}

                    {TestButton}

                    {SaveButton}
                </Stack>
            </Toolbar>

            <Collapse in={formActive} unmountOnExit>
                <LinearProgress />
            </Collapse>
        </Stack>
    );
}

export default EntityToolbar;

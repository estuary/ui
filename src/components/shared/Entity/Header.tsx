import {
    Box,
    Collapse,
    LinearProgress,
    Stack,
    SxProps,
    Theme,
    Toolbar,
    Typography,
} from '@mui/material';
import { ReactNode } from 'react';
import { useFormStateStore_isActive } from 'stores/FormState';

// TODO: Make the generate button Props property required once the edit workflow matures.
interface Props {
    GenerateButton?: ReactNode;
    TestButton: ReactNode;
    SaveButton: ReactNode;
    heading: ReactNode;
    ErrorSummary: ReactNode;
}

export const buttonSx: SxProps<Theme> = { ml: 1 };

function FooHeader({
    GenerateButton,
    TestButton,
    SaveButton,
    heading,
    ErrorSummary,
}: Props) {
    const formActive = useFormStateStore_isActive();

    return (
        <Stack spacing={2} sx={{ mb: 1 }}>
            <Toolbar disableGutters>
                <Typography variant="h6" noWrap>
                    {heading}
                </Typography>

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
                    {GenerateButton ? GenerateButton : null}

                    {TestButton}

                    {SaveButton}
                </Stack>
            </Toolbar>

            <Collapse in={formActive} unmountOnExit>
                <LinearProgress />
            </Collapse>

            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>{ErrorSummary}</Box>
        </Stack>
    );
}

export default FooHeader;

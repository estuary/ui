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
import ValidationErrorSummary from 'components/shared/Entity/ValidationErrorSummary';
import {
    FormStateStoreNames,
    ResourceConfigStoreNames,
    useZustandStore,
} from 'context/Zustand';
import { ReactNode } from 'react';
import { EntityFormState } from 'stores/FormState';

// TODO: Make the generate button Props property required once the edit workflow matures.
interface Props {
    GenerateButton?: ReactNode;
    TestButton: ReactNode;
    SaveButton: ReactNode;
    heading: ReactNode;
    formErrorsExist: boolean;
    formStateStoreName: FormStateStoreNames;
    resourceConfigStoreName?: ResourceConfigStoreNames;
}

export const buttonSx: SxProps<Theme> = { ml: 1 };

function FooHeader({
    GenerateButton,
    TestButton,
    SaveButton,
    heading,
    formErrorsExist,
    formStateStoreName,
    resourceConfigStoreName,
}: Props) {
    const formActive = useZustandStore<
        EntityFormState,
        EntityFormState['isActive']
    >(formStateStoreName, (state) => state.isActive);

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

            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                <ValidationErrorSummary
                    errorsExist={formErrorsExist}
                    formStateStoreName={formStateStoreName}
                    resourceConfigStoreName={resourceConfigStoreName}
                />
            </Box>
        </Stack>
    );
}

export default FooHeader;

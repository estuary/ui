import {
    Collapse,
    LinearProgress,
    Stack,
    SxProps,
    Theme,
    Toolbar,
    Typography,
} from '@mui/material';
import ValidationErrorSummary from 'components/shared/Entity/ValidationErrorSummary';
import { useRouteStore } from 'hooks/useRouteStore';
import { ReactNode } from 'react';
import { entityCreateStoreSelectors, formInProgress } from 'stores/Create';

interface Props {
    TestButton: ReactNode;
    SaveButton: ReactNode;
    heading: ReactNode;
}

export const buttonSx: SxProps<Theme> = { ml: 1, borderRadius: 5 };

function FooHeader({ TestButton, SaveButton, heading }: Props) {
    const entityCreateStore = useRouteStore();
    const formStateStatus = entityCreateStore(
        entityCreateStoreSelectors.formState.status
    );

    return (
        <>
            <Toolbar disableGutters>
                <Typography variant="h6" noWrap>
                    {heading}
                </Typography>

                <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                        ml: 'auto',
                    }}
                >
                    {TestButton}

                    {SaveButton}
                </Stack>
            </Toolbar>

            <Collapse in={formInProgress(formStateStatus)} unmountOnExit>
                <LinearProgress sx={{ mb: 2 }} />
            </Collapse>
            <ValidationErrorSummary />
        </>
    );
}

export default FooHeader;

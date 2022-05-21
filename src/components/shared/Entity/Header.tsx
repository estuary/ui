import {
    Button,
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
import { FormattedMessage } from 'react-intl';
import {
    entityCreateStoreSelectors,
    formInProgress,
    FormStatus,
} from 'stores/Create';

interface Props {
    TestButton: ReactNode;
    save: (event: any) => void;
    saveDisabled: boolean;
    heading: ReactNode;
}

const buttonSx: SxProps<Theme> = { ml: 1, borderRadius: 5 };

function FooHeader({ TestButton, save, saveDisabled, heading }: Props) {
    const entityCreateStore = useRouteStore();
    const formStateStatus = entityCreateStore(
        entityCreateStoreSelectors.formState.status
    );
    const setFormState = entityCreateStore(
        entityCreateStoreSelectors.formState.set
    );

    const handlers = {
        test: (event: any) => {
            setFormState({
                status: FormStatus.TESTING,
            });
            test(event);
        },
        save: (event: any) => {
            setFormState({
                status: FormStatus.SAVING,
            });
            save(event);
        },
    };

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

                    <Button
                        onClick={handlers.save}
                        disabled={
                            formInProgress(formStateStatus) || saveDisabled
                        }
                        sx={buttonSx}
                    >
                        <FormattedMessage id="cta.saveEntity" />
                    </Button>
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

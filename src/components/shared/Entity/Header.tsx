import {
    Button,
    Collapse,
    LinearProgress,
    Stack,
    Toolbar,
    Typography,
} from '@mui/material';
import { EditorStoreState } from 'components/editor/Store';
import ValidationErrorSummary from 'components/shared/Entity/ValidationErrorSummary';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    entityCreateStoreSelectors,
    formInProgress,
    FormStatus,
} from 'stores/Create';

interface Props {
    close: (event: any) => void;
    test: (event: any) => void;
    testDisabled: boolean;
    save: (event: any) => void;
    saveDisabled: boolean;
    formId: string;
    heading: ReactNode;
}

function FooHeader({
    close,
    test,
    testDisabled,
    save,
    saveDisabled,
    formId,
    heading,
}: Props) {
    const id = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >((state) => state.id);

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
            <Toolbar>
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
                    <Button variant="text" onClick={close} color="error">
                        <FormattedMessage id="cta.cancel" />
                    </Button>

                    <Button
                        onClick={handlers.test}
                        disabled={
                            formInProgress(formStateStatus) || testDisabled
                        }
                        form={formId}
                        type="submit"
                        color="success"
                    >
                        <FormattedMessage
                            id={
                                id
                                    ? 'foo.ctas.discoverAgain'
                                    : 'foo.ctas.discover'
                            }
                        />
                    </Button>

                    <Button
                        onClick={handlers.save}
                        disabled={
                            formInProgress(formStateStatus) || saveDisabled
                        }
                        color="success"
                    >
                        <FormattedMessage id="cta.saveEntity" />
                    </Button>
                </Stack>
            </Toolbar>
            <Collapse in={formInProgress(formStateStatus)} unmountOnExit>
                <LinearProgress />
            </Collapse>
            <ValidationErrorSummary />
        </>
    );
}

export default FooHeader;

import { Button, Stack, Toolbar, Typography } from '@mui/material';
import { EditorStoreState, useZustandStore } from 'components/editor/Store';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { FormattedMessage } from 'react-intl';

interface Props {
    close: (event: any) => void;
    test: (event: any) => void;
    testDisabled: boolean;
    save: (event: any) => void;
    saveDisabled: boolean;
    formId: string;
}

function NewCaptureHeader({
    close,
    test,
    testDisabled,
    save,
    saveDisabled,
    formId,
}: Props) {
    const id = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >((state) => state.id);

    console.log('header', id);

    return (
        <Toolbar>
            <Typography variant="h6" noWrap>
                <FormattedMessage id="captureCreation.heading" />
            </Typography>
            <Stack
                direction="row"
                alignItems="center"
                sx={{
                    ml: 'auto',
                }}
            >
                <Button onClick={close} color="error">
                    <FormattedMessage id="cta.cancel" />
                </Button>

                <Button
                    onClick={test}
                    disabled={testDisabled}
                    form={formId}
                    type="submit"
                    color="success"
                    variant="contained"
                    disableElevation
                >
                    <FormattedMessage
                        id={
                            id
                                ? 'captureCreation.ctas.discoverAgain'
                                : 'captureCreation.ctas.discover'
                        }
                    />
                </Button>

                <Button
                    onClick={save}
                    disabled={saveDisabled}
                    color="success"
                    variant="contained"
                    disableElevation
                >
                    <FormattedMessage id="cta.saveEntity" />
                </Button>
            </Stack>
        </Toolbar>
    );
}

export default NewCaptureHeader;

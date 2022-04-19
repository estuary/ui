import { Button, Stack, Toolbar, Typography } from '@mui/material';
import useEditorStore, {
    editorStoreSelectors,
} from 'components/draft/editor/Store';
import { EventHandler } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    close: EventHandler<any>;
    test: EventHandler<any>;
    save: EventHandler<any>;
    testDisabled: boolean;
    saveDisabled: boolean;
    formId: string;
}

function NewMaterializationHeader({
    close,
    test,
    save,
    testDisabled,
    saveDisabled,
    formId,
}: Props) {
    const draftId = useEditorStore(editorStoreSelectors.draftId);

    return (
        <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" noWrap>
                <FormattedMessage id="materializationCreation.heading" />
            </Typography>

            <Stack direction="row" alignItems="center" spacing={1}>
                <Button color="error" onClick={close}>
                    <FormattedMessage id="cta.cancel" />
                </Button>

                <Button
                    form={formId}
                    type="submit"
                    color="success"
                    variant="contained"
                    disableElevation
                    disabled={testDisabled}
                    onClick={test}
                >
                    <FormattedMessage
                        id={
                            draftId
                                ? 'captureCreation.ctas.discoverAgain'
                                : 'captureCreation.ctas.discover'
                        }
                    />
                </Button>

                <Button
                    color="success"
                    variant="contained"
                    disableElevation
                    disabled={saveDisabled}
                    onClick={save}
                >
                    <FormattedMessage id="cta.saveEntity" />
                </Button>
            </Stack>
        </Toolbar>
    );
}

export default NewMaterializationHeader;

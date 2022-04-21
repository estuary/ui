import { Button, Stack, Toolbar, Typography } from '@mui/material';
import { EventHandler } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    close: EventHandler<any>;
    test: EventHandler<any>;
    save: EventHandler<any>;
    testDisabled: boolean;
    saveDisabled: boolean;
}

function NewMaterializationHeader({
    close,
    test,
    save,
    testDisabled,
    saveDisabled,
}: Props) {
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
                    color="success"
                    variant="contained"
                    disableElevation
                    disabled={testDisabled}
                    onClick={test}
                >
                    <FormattedMessage id="materializationCreation.cta.test" />
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

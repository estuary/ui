import { Collapse, Grid } from '@mui/material';

import { useIntl } from 'react-intl';

import {
    useBindingsEditorStore_inferSchemaResponseEmpty,
    useBindingsEditorStore_inferSchemaResponseError,
} from 'src/components/editor/Bindings/Store/hooks';
import AlertBox from 'src/components/shared/AlertBox';

function SchemaWarning() {
    const intl = useIntl();

    const inferSchemaError = useBindingsEditorStore_inferSchemaResponseError();
    const inferSchemaResponseEmpty =
        useBindingsEditorStore_inferSchemaResponseEmpty();

    const show = Boolean(
        inferSchemaResponseEmpty ||
            (inferSchemaError && inferSchemaError.length > 0)
    );

    return (
        <Grid
            item
            xs={12}
            sx={{
                display: show ? undefined : 'none',
                height: show ? undefined : 0,
            }}
        >
            <Collapse component={Grid} in={show}>
                <AlertBox
                    short
                    severity="error"
                    title={intl.formatMessage({
                        id: 'schemaEditor.error.title',
                    })}
                >
                    {inferSchemaError?.map((error) => {
                        return error;
                    })}
                </AlertBox>
            </Collapse>
        </Grid>
    );
}

export default SchemaWarning;

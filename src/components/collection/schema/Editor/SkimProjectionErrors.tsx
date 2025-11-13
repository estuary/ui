import type { KeyValue } from 'src/components/shared/KeyValueList';

import { Collapse, Grid, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import {
    useBindingsEditorStore_skimProjectionResponseEmpty,
    useBindingsEditorStore_skimProjectionResponseError,
} from 'src/components/editor/Bindings/Store/hooks';
import AlertBox from 'src/components/shared/AlertBox';
import KeyValueList from 'src/components/shared/KeyValueList';

// skim_collection_projections can _technically_ return an array of any length.
//  this should not really happen but just to be safe we will limit showing only
//  3 at a time. If a user gets TONs of errors - the UX would be the user fixing
//  several errors at once and slowly seeing more errors.

const maxToDisplay = 3;
function SkimProjectionErrors() {
    const intl = useIntl();

    const skimProjectionResponseError =
        useBindingsEditorStore_skimProjectionResponseError();
    const skimProjectionResponseEmpty =
        useBindingsEditorStore_skimProjectionResponseEmpty();

    const total = skimProjectionResponseError
        ? skimProjectionResponseError.length
        : 0;

    const errors: KeyValue[] =
        skimProjectionResponseError
            ?.slice(0, maxToDisplay)
            .map((error, index) => {
                return {
                    title: (
                        <Typography
                            key={`skim-projections-errors-${index}`}
                            component="span"
                        >
                            {error}
                        </Typography>
                    ),
                };
            }) ?? [];

    const show = Boolean(skimProjectionResponseEmpty || errors.length > 0);

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
                    {total > maxToDisplay ? (
                        <Typography>
                            {intl.formatMessage(
                                { id: 'errors.preface.totalCount' },
                                {
                                    displaying: maxToDisplay,
                                    total,
                                }
                            )}
                        </Typography>
                    ) : null}
                    <KeyValueList data={errors} disableTypography />
                </AlertBox>
            </Collapse>
        </Grid>
    );
}

export default SkimProjectionErrors;

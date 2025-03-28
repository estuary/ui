import { Chip, Grid, ListItem, Skeleton, Stack, Tooltip } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import {
    useBindingsEditorStore_inferSchemaResponse_Keys,
    useBindingsEditorStore_inferSchemaResponseDoneProcessing,
    useBindingsEditorStore_inferSchemaResponseEmpty,
} from 'src/components/editor/Bindings/Store/hooks';
import AlertBox from 'src/components/shared/AlertBox';
import { hasLength } from 'src/utils/misc-utils';
import SchemaKeyHeader from 'src/components/schema/KeyAutoComplete/Header';
import { keyIsValidOption } from 'src/components/schema/KeyAutoComplete/shared';

interface Props {
    value: string[] | null;
}

function ReadOnly({ value }: Props) {
    const intl = useIntl();
    const valueEmpty = !value || !hasLength(value);

    const inferSchemaResponseEmpty =
        useBindingsEditorStore_inferSchemaResponseEmpty();

    const inferSchemaResponseDoneProcessing =
        useBindingsEditorStore_inferSchemaResponseDoneProcessing();

    const keys = useBindingsEditorStore_inferSchemaResponse_Keys();

    // TODO (collection editor) move these helper vars into the store
    const noUsableKeys = !hasLength(keys);

    if (!inferSchemaResponseDoneProcessing) {
        return (
            <Grid item xs={12}>
                <SchemaKeyHeader />

                <Stack direction="row" spacing={1}>
                    <Skeleton width={50} />
                    <Skeleton width={50} />
                    <Skeleton width={50} />
                </Stack>
            </Grid>
        );
    }

    return (
        <Grid item xs={12}>
            <SchemaKeyHeader />

            {valueEmpty ? (
                <AlertBox
                    short
                    severity="warning"
                    title={
                        <FormattedMessage id="keyAutoComplete.keys.missing.title" />
                    }
                >
                    <FormattedMessage id="keyAutoComplete.keys.missing.message" />
                </AlertBox>
            ) : (
                <Stack
                    direction="row"
                    component="ol"
                    sx={{
                        alignItems: 'center',
                        alignContent: 'center',
                        flexFlow: 'wrap',
                        overflowY: 'wr',
                        pl: 0,
                        mt: 0,
                    }}
                >
                    {value.map((key: string) => {
                        const validOption = keyIsValidOption(keys, key);
                        const Tag = (
                            <ListItem
                                key={`read-only-keys-${key}`}
                                dense
                                sx={{ px: 0.5, width: 'auto' }}
                            >
                                <Chip
                                    label={key}
                                    color={!validOption ? 'error' : undefined}
                                />
                            </ListItem>
                        );

                        if (validOption) {
                            return Tag;
                        }

                        return (
                            <Tooltip
                                key={`read-only-keys-${key}`}
                                title={intl.formatMessage({
                                    id: 'keyAutoComplete.keys.invalid.message.readOnly',
                                })}
                            >
                                {Tag}
                            </Tooltip>
                        );
                    })}
                </Stack>
            )}

            {inferSchemaResponseEmpty ? (
                <AlertBox short severity="warning">
                    <FormattedMessage id="keyAutoComplete.noOptions.message" />
                </AlertBox>
            ) : noUsableKeys ? (
                <AlertBox short severity="warning">
                    <FormattedMessage id="keyAutoComplete.noUsableKeys.message" />
                </AlertBox>
            ) : null}
        </Grid>
    );
}

export default ReadOnly;

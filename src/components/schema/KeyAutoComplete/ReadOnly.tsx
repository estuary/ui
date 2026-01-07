import { Grid, ListItem, Skeleton, Stack, Tooltip } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import {
    useBindingsEditorStore_skimProjectionResponse_Keys,
    useBindingsEditorStore_skimProjectionResponseDoneProcessing,
    useBindingsEditorStore_skimProjectionResponseEmpty,
} from 'src/components/editor/Bindings/Store/hooks';
import SchemaKeyHeader from 'src/components/schema/KeyAutoComplete/Header';
import { keyIsValidOption } from 'src/components/schema/KeyAutoComplete/shared';
import AlertBox from 'src/components/shared/AlertBox';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';
import { hasLength } from 'src/utils/misc-utils';

interface Props {
    value: string[] | null;
}

function ReadOnly({ value }: Props) {
    const intl = useIntl();
    const valueEmpty = !value || !hasLength(value);

    const skimProjectionResponseEmpty =
        useBindingsEditorStore_skimProjectionResponseEmpty();

    const skimProjectionResponseDoneProcessing =
        useBindingsEditorStore_skimProjectionResponseDoneProcessing();

    const keys = useBindingsEditorStore_skimProjectionResponse_Keys();

    // TODO (collection editor) move these helper vars into the store
    const noUsableKeys = !hasLength(keys);

    if (!skimProjectionResponseDoneProcessing) {
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
                <AlertBox short severity="warning">
                    {intl.formatMessage({
                        id: 'keyAutoComplete.keys.missing.title',
                    })}
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
                                <OutlinedChip
                                    color={!validOption ? 'error' : undefined}
                                    label={key}
                                    variant="outlined"
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

            {skimProjectionResponseEmpty ? (
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

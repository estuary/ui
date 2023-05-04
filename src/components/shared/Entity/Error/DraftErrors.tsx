import { Box, Breadcrumbs, Typography } from '@mui/material';
import KeyValueList, { KeyValue } from 'components/shared/KeyValueList';
import useDraftSpecErrors from 'hooks/useDraftSpecErrors';
import { FormattedMessage } from 'react-intl';

export interface DraftErrorProps {
    draftId?: string | null;
    enablePolling?: boolean;
}

function DraftErrors({ draftId, enablePolling }: DraftErrorProps) {
    const { draftSpecErrors, count } = useDraftSpecErrors(
        draftId,
        enablePolling
    );

    //Make sure we have errors to display
    const errorLength = draftSpecErrors.length;
    if (errorLength > 0) {
        const errors: KeyValue[] = draftSpecErrors.map((draftError) => {
            const filteredScope = draftError.scope
                // Strip the canonical source file used by control-plane builds.
                // It's not user-defined and thus not useful to the user.
                .replace('file:///flow.json#', '')
                // Remove JSON pointer escapes. The result is not technically a JSON pointer,
                // but it's far more legible.
                .replaceAll('~1', '/')
                .replaceAll('~0', '~');

            // TODO (johnny) - this is where the scopes need populated
            const scopes = filteredScope.split('/');

            return {
                val: (
                    <Box
                        sx={{
                            overflowY: 'auto',
                            pl: 2,
                            whiteSpace: 'pre',
                        }}
                    >
                        {draftError.detail}
                    </Box>
                ),
                title: (
                    <Breadcrumbs>
                        {scopes.map((scope) => {
                            return (
                                <Typography
                                    key={`draft-error-breadcrumbs-${scope}`}
                                    variant="h6"
                                    component="span"
                                >
                                    {scope}
                                </Typography>
                            );
                        })}
                    </Breadcrumbs>
                ),
            };
        });

        return (
            <Box>
                {count && count > errorLength ? (
                    <Typography>
                        <FormattedMessage
                            id="draftErrors.totalCount"
                            values={{
                                displaying: errorLength,
                                total: count,
                            }}
                        />
                    </Typography>
                ) : null}
                <KeyValueList data={errors} disableTypography />
            </Box>
        );
    } else {
        return null;
    }
}

export default DraftErrors;

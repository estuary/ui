import { Box, Breadcrumbs, Typography } from '@mui/material';
import KeyValueList, { KeyValue } from 'components/shared/KeyValueList';
import useDraftSpecErrors from 'hooks/useDraftSpecErrors';
import { FormattedMessage } from 'react-intl';

export interface DraftErrorProps {
    draftId?: string | null;
    enablePolling?: boolean;
}

// Parse a draft error scope, which is generally a URL with a fragment-encoded
// JSON pointer, into structured bread crumb components.
function parseScopeCrumbs(scope: string): string[] {
    const parts: Array<string> = [];

    // Match either a resource with a JSON fragment pointer, or a simple resource.
    const pivot = scope.indexOf('#/');
    if (pivot != -1) {
        // Decode the fragment into a JSON pointer.
        const ptr = decodeURIComponent(scope.slice(pivot + 2));

        parts.push(scope.slice(0, pivot));

        // Split the pointer into its components, de-escaping each,
        // and adding to `parts`.
        ptr.split('/').forEach((component) =>
            parts.push(component.replace(/~1/g, '/').replace(/~0/g, '~'))
        );
    } else {
        parts.push(scope);
    }

    // Strip the canonical source file used by control-plane builds.
    // It's not user-defined and thus not useful to the user.
    if (parts[0] == 'file:///flow.json') {
        parts.shift();
    }
    return parts;
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
            const crumbs = parseScopeCrumbs(draftError.scope);

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
                        {crumbs.map((scope) => {
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

import type { KeyValue } from 'src/components/shared/KeyValueList';

import { Box, Breadcrumbs, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import KeyValueList from 'src/components/shared/KeyValueList';
import useDraftSpecErrors from 'src/hooks/useDraftSpecErrors';

export interface DraftErrorProps {
    draftId?: string | null;
    enablePolling?: boolean;
    enableAlertStyling?: boolean;
    maxErrors?: number;
}

// Parse a draft error scope, which is generally a URL with a fragment-encoded
// JSON pointer, into structured bread crumb components.
function parseScopeCrumbs(scope: string): string[] {
    const parts: Array<string> = [];

    // Match either a resource with a JSON fragment pointer, or a simple resource.
    const pivot = scope.indexOf('#/');
    if (pivot !== -1) {
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
    if (parts[0] === 'file:///flow.json') {
        parts.shift();
    }
    return parts;
}

function DraftErrors({
    draftId,
    enablePolling,
    enableAlertStyling,
    maxErrors,
}: DraftErrorProps) {
    const intl = useIntl();

    const { draftSpecErrors, count } = useDraftSpecErrors(
        draftId,
        enablePolling,
        maxErrors
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
                                    component="span"
                                    sx={{ fontWeight: 500 }}
                                >
                                    {scope}
                                </Typography>
                            );
                        })}
                    </Breadcrumbs>
                ),
            };
        });

        const content = (
            <>
                {count && count > errorLength ? (
                    <Typography>
                        {intl.formatMessage(
                            { id: 'errors.preface.totalCount' },
                            {
                                displaying: errorLength,
                                total: count,
                            }
                        )}
                    </Typography>
                ) : null}
                <KeyValueList data={errors} disableTypography />
            </>
        );

        if (enableAlertStyling) {
            return (
                <AlertBox short hideIcon severity="error">
                    {content}
                </AlertBox>
            );
        }

        return <Box>{content}</Box>;
    } else {
        return null;
    }
}

export default DraftErrors;

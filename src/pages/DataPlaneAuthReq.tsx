import { Box, Toolbar, Typography } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { getLiveSpecs_dataPlaneAuthReq } from 'api/liveSpecsExt';
import { authenticatedRoutes } from 'app/routes';
import AlertBox from 'components/shared/AlertBox';
import usePageTitle from 'hooks/usePageTitle';
import useReactorToken from 'hooks/useReactorToken';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { logRocketConsole } from 'services/shared';
import { SHARD_LABELS } from 'utils/dataPlane-utils';

interface RedirectResult {
    targetUrl?: string;
    error?: string | null;
}

const DataPlaneAuthReq = () => {
    usePageTitle({
        header: authenticatedRoutes.captures.title,
        headerLink: 'https://docs.estuary.dev/concepts/#captures',
    });

    const intl = useIntl();

    const [searchParams] = useSearchParams();
    const catalogPrefix = searchParams.get('prefix');
    const originalUrl = searchParams.get('orig_url');

    const {
        gatewayAuthToken,
        gatewayUrl,
        error: gatewayAuthError,
    } = useReactorToken(catalogPrefix);

    const [redirectResult, setRedirectResult] = useState<RedirectResult>({});

    useEffect(() => {
        if (!catalogPrefix || !originalUrl) {
            setRedirectResult({
                error: 'Invalid URL parameters. Please contact support for assistance.',
            });

            
        } else if (gatewayAuthError) {
            setRedirectResult({ error: gatewayAuthError.toString() });

            
        } else if (gatewayUrl && gatewayAuthToken) {
            getLiveSpecs_dataPlaneAuthReq(catalogPrefix).then(
                (response) => {
                    const hostnameLabelValue =
                        response.data?.[0]?.shard_labels.find(
                            (label) => label.name === SHARD_LABELS.HOSTNAME
                        )?.value;

                    if (response.error || !hostnameLabelValue) {
                        setRedirectResult({
                            error: `Failed to validate 'orig_url' parameter.`,
                        });

                        return;
                    }

                    try {
                        const gatewayHost = gatewayUrl.hostname;

                        // TODO (url-util): create and use URL formatting util.
                        const origUrlHostname = new URL(originalUrl).hostname;

                        // Validate that the hostname in the orig_url is a subdomain of the gateway_url.
                        // This is necessary in order to prevent malicious links using an `orig_url` parameter
                        // that sends a user's auth token to a 3rd party.

                        // Validate that the hostname in the orig_url subdomain matches that of the task subdomain.
                        if (
                            !origUrlHostname.startsWith(hostnameLabelValue) ||
                            !origUrlHostname.endsWith(`.${gatewayHost}`)
                        ) {
                            setRedirectResult({
                                error: 'invalid `orig_url` parameter has invalid hostname',
                            });

                            return;
                        }
                    } catch (e: unknown) {
                        console.error('invalid orig_url url parameter', e);

                        setRedirectResult({
                            error: 'invalid `orig_url` parameter cannot be parsed as a URL',
                        });

                        return;
                    }

                    // TODO (url-util): create and use URL formatting util.
                    const newUrl = new URL('/auth-redirect', originalUrl);
                    newUrl.searchParams.append('token', gatewayAuthToken);
                    newUrl.searchParams.append('orig_url', originalUrl);

                    logRocketConsole('redirecting after successful auth', {
                        newUrl,
                        gatewayUrl,
                        originalUrl,
                    });
                    window.location.replace(newUrl.toString());
                },
                (errorResponse) => {
                    setRedirectResult({
                        error: (errorResponse as PostgrestError).message,
                    });
                }
            );
        }
    }, [
        catalogPrefix,
        gatewayAuthError,
        gatewayAuthToken,
        gatewayUrl,
        originalUrl,
        setRedirectResult,
    ]);

    return (
        <>
            <Toolbar
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            />

            <Box style={{ marginBottom: 2, padding: 2 }}>
                {redirectResult.error ? (
                    <AlertBox short severity="error">
                        <Typography>
                            {intl.formatMessage(
                                { id: 'dataPlaneAuthReq.error.message' },
                                { catalogPrefix, error: redirectResult.error }
                            )}
                        </Typography>
                    </AlertBox>
                ) : (
                    <Typography>
                        {intl.formatMessage(
                            { id: 'dataPlaneAuthReq.waiting.message' },
                            { catalogPrefix, originalUrl }
                        )}
                    </Typography>
                )}
            </Box>
        </>
    );
};

export default DataPlaneAuthReq;

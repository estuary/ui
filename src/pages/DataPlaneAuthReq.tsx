import { Box, Toolbar, Typography } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { getLiveSpecs_dataPlaneAuthReq } from 'api/liveSpecsExt';
import { authenticatedRoutes } from 'app/routes';
import Error from 'components/shared/Error';
import usePageTitle from 'hooks/usePageTitle';
import useReactorToken from 'hooks/useReactorToken';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { logRocketConsole } from 'services/shared';
import { SHARD_LABELS } from 'utils/dataPlane-utils';
import { getURL } from 'utils/misc-utils';

interface RedirectResult {
    targetUrl?: string;
    error?: PostgrestError | string | null;
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
        reactorToken,
        reactorUrl,
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
        } else if (reactorUrl && reactorToken) {
            getLiveSpecs_dataPlaneAuthReq(catalogPrefix).then(
                (response) => {
                    const hostnameLabelValue =
                        response.data?.[0]?.shard_labels.find(
                            (label) => label.name === SHARD_LABELS.HOSTNAME
                        )?.value;

                    if (response.error || !hostnameLabelValue) {
                        setRedirectResult({
                            error:
                                response.error ??
                                `Failed to validate 'orig_url' parameter.`,
                        });

                        return;
                    }

                    const gatewayHost = reactorUrl.hostname;

                    const origUrlHostname = getURL(
                        originalUrl,
                        'DataPlaneAuthReq : invalid `orig_url` parameter cannot be parsed as a URL'
                    )?.hostname;

                    if (!origUrlHostname) {
                        setRedirectResult({
                            error: 'invalid `orig_url` parameter cannot be parsed as a URL',
                        });

                        return;
                    }

                    // Validate that the hostname in the orig_url is a subdomain of the gateway_url and
                    // that its subdomain matches that of the task subdomain. This is necessary in order
                    // to prevent malicious links using an `orig_url` parameter that sends
                    // a user's auth token to a 3rd party.
                    if (
                        !origUrlHostname.startsWith(hostnameLabelValue) ||
                        !origUrlHostname.endsWith(`.${gatewayHost}`)
                    ) {
                        setRedirectResult({
                            error: 'invalid `orig_url` parameter has invalid hostname',
                        });

                        return;
                    }

                    const newUrl = getURL(
                        '/auth-redirect',
                        `DataPlaneAuthReq : failed to compose /auth-redirect URL using 'orig_url' parameter`,
                        originalUrl
                    );

                    if (!newUrl) {
                        setRedirectResult({
                            error: `failed to compose /auth-redirect URL using 'orig_url' parameter`,
                        });

                        return;
                    }

                    newUrl.searchParams.append('token', reactorToken);
                    newUrl.searchParams.append('orig_url', originalUrl);

                    logRocketConsole('redirecting after successful auth', {
                        newUrl,
                        reactorUrl,
                        originalUrl,
                    });
                    window.location.replace(newUrl.toString());
                },
                (error: PostgrestError) => {
                    setRedirectResult({ error });
                }
            );
        }
    }, [
        catalogPrefix,
        gatewayAuthError,
        originalUrl,
        reactorToken,
        reactorUrl,
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
                    <Error
                        condensed
                        error={
                            typeof redirectResult.error === 'string'
                                ? {
                                      message: intl.formatMessage(
                                          {
                                              id: 'dataPlaneAuthReq.error.message',
                                          },
                                          {
                                              catalogPrefix,
                                              error: redirectResult.error,
                                          }
                                      ),
                                  }
                                : redirectResult.error
                        }
                    />
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

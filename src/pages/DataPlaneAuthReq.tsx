import { Box, SxProps, Theme, Toolbar, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import AlertBox from 'components/shared/AlertBox';
import usePageTitle from 'hooks/usePageTitle';
import useScopedGatewayAuthToken from 'hooks/useScopedGatewayAuthToken';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { logRocketConsole } from 'services/logrocket';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

interface RedirectResult {
    targetUrl?: string;
    error?: string;
}

const DataPlaneAuthReq = () => {
    usePageTitle({
        header: authenticatedRoutes.captures.title,
        headerLink: 'https://docs.estuary.dev/concepts/#captures',
    });

    const [searchParams] = useSearchParams();
    const catalogPrefix = searchParams.get('prefix');
    const originalUrl = searchParams.get('orig_url');

    const gatewayAuth = useScopedGatewayAuthToken(catalogPrefix);
    const gatewayAuthError = gatewayAuth.error;
    const gatewayUrl = gatewayAuth.data?.gateway_url.toString();
    const gatewayAuthToken = gatewayAuth.data?.token;

    const [redirectResult, setRedirectResult] = useState<RedirectResult>({});

    useEffect(() => {
        let error = null;
        if (!catalogPrefix || !originalUrl) {
            error =
                'Invalid URL parameters. Please contact support for assistance.';
        } else if (gatewayAuthError) {
            error = gatewayAuthError.toString();
        } else if (gatewayUrl && gatewayAuthToken) {
            // Validate that the hostname in the orig_url is a subdomain of the gateway_url.
            // This is necessary in order to prevent malicious links using an `orig_url` parameter
            // that sends a user's auth token to a 3rd party.
            // Ideally we would also validate that the subdomain matches the subdomain of the task,
            // but doing so will require that control-plane be aware of those subdomains, which
            // won't be the case until we implement pet-names.
            try {
                const gatewayHost = new URL(gatewayUrl).hostname;
                const origUrlHostname = new URL(originalUrl).hostname;
                if (!origUrlHostname.endsWith(`.${gatewayHost}`)) {
                    error = 'invalid `orig_url` parameter has invalid hostname';
                }
            } catch (e: unknown) {
                console.error('invalid orig_url url parameter', e);
                error =
                    'invalid `orig_url` parameter cannot be parsed as a URL';
            }

            if (error === null) {
                const newUrl = new URL('/auth-redirect', originalUrl);
                newUrl.searchParams.append('token', gatewayAuthToken);
                newUrl.searchParams.append('orig_url', originalUrl);

                logRocketConsole('redirecting after successful auth', {
                    newUrl,
                    gatewayUrl,
                    originalUrl,
                });
                window.location.replace(newUrl.toString());
            }
        }

        if (error) {
            setRedirectResult({ error });
        }
    }, [
        gatewayAuthError,
        gatewayUrl,
        gatewayAuthToken,
        setRedirectResult,
        catalogPrefix,
        originalUrl,
    ]);

    let elem = null;
    if (redirectResult.error) {
        elem = (
            <AlertBox short severity="error">
                <FormattedMessage
                    id="dataPlaneAuthReq.error.message"
                    values={{ catalogPrefix, error: redirectResult.error }}
                />
            </AlertBox>
        );
    } else {
        // We're still waiting on the response from the fetching the access token
        elem = (
            <Typography>
                <FormattedMessage
                    id="dataPlaneAuthReq.waiting.message"
                    values={{ catalogPrefix, originalUrl }}
                />
            </Typography>
        );
    }

    return (
        <>
            <Toolbar
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            />

            <Box sx={boxStyling}>{elem}</Box>
        </>
    );
};

export default DataPlaneAuthReq;

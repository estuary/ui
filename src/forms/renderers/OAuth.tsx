import { ControlProps, RankedTester, rankWith } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { accessToken, authURL } from 'api/oauth';
import FullPageSpinner from 'components/fullPage/Spinner';
import { optionExists } from 'forms/renderers/Overrides/testers/testers';
import { useOAuth2 } from 'hooks/forks/react-use-oauth2/components';
import { every, includes, isEmpty, startCase } from 'lodash';
import { useMemo, useState } from 'react';
import GoogleButton from 'react-google-button';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDetailsForm_connectorImage_connectorId } from 'stores/DetailsForm';
import { Options } from 'types/jsonforms';
import { hasLength } from 'utils/misc-utils';

const NO_PROVIDER = 'noProviderFound';

export const oAuthProviderTester: RankedTester = rankWith(
    1000,
    optionExists(Options.oauthProvider)
);

// This is blank on purpose. For right now we can just show null settings are nothing
const OAuthproviderRenderer = ({
    data,
    path,
    handleChange,
    uischema,
}: ControlProps) => {
    const intl = useIntl();
    const { options } = uischema;
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const dataKeys = Object.keys(data);
    const requiredFields = useMemo(
        () => (options ? options[Options.oauthFields] : []),
        [options]
    );
    const isAuthorized = useMemo(
        () =>
            every(requiredFields, (field: string) => {
                return field === 'client_id' || field === 'client_secret'
                    ? true
                    : includes(dataKeys, field);
            }),
        [dataKeys, requiredFields]
    );

    const provider = options ? options[Options.oauthProvider] : NO_PROVIDER;
    const capitalizedProvider = useMemo(() => startCase(provider), [provider]);

    const onError = (error_: any) => {
        setErrorMessage(error_);
    };

    const onSuccess = async (payload: any) => {
        const tokenResponse = await accessToken(payload.state, payload.code);

        if (tokenResponse.error) {
            setErrorMessage(
                intl.formatMessage(
                    { id: 'oauth.accessToken.error' },
                    {
                        provider: capitalizedProvider,
                    }
                )
            );
        } else if (!isEmpty(tokenResponse.data)) {
            handleChange(path, {
                ...tokenResponse.data,
            });
        }
    };

    const { loading, getAuth } = useOAuth2({
        onSuccess,
        onError,
    });

    const imageTag = useDetailsForm_connectorImage_connectorId();

    const openPopUp = async () => {
        setErrorMessage(null);

        const fetchAuthURL = await authURL(imageTag);

        if (fetchAuthURL.error) {
            setErrorMessage(
                intl.formatMessage({ id: 'oauth.fetchAuthURL.error' })
            );
        } else if (!isEmpty(fetchAuthURL.data)) {
            // This kicks off the call and the success is handled with the onSuccess/onError
            getAuth(fetchAuthURL.data.url, fetchAuthURL.data.state);
        }
    };

    const removeCofig = () => {
        handleChange(path, undefined);
    };

    return (
        <>
            <Typography>
                <FormattedMessage
                    id="oauth.instructions"
                    values={{ provider: capitalizedProvider }}
                />
            </Typography>

            {hasLength(errorMessage) ? (
                <Alert severity="error">{errorMessage}</Alert>
            ) : null}

            <Stack direction="row" spacing={2}>
                <Alert severity="warning">
                    Under Development - do not use in prod
                </Alert>

                {provider === 'google' ? (
                    <GoogleButton disabled={loading} onClick={openPopUp} />
                ) : null}

                {isAuthorized ? (
                    <>
                        <Alert severity="success">Authenticated</Alert>
                        <Button onClick={removeCofig}>Remove</Button>
                    </>
                ) : null}
            </Stack>

            {loading ? <FullPageSpinner /> : null}
        </>
    );
};

export const OAuthType = withJsonFormsControlProps(OAuthproviderRenderer);

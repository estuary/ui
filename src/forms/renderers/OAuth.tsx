import { ControlProps, RankedTester, rankWith } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { accessToken, authURL } from 'api/oauth';
import FullPageSpinner from 'components/fullPage/Spinner';
import { optionExists } from 'forms/renderers/Overrides/testers/testers';
import { useOAuth2 } from 'hooks/forks/react-use-oauth2/components';
import { useRouteStore } from 'hooks/useRouteStore';
import { isEmpty } from 'lodash';
import { useState } from 'react';
import GoogleButton from 'react-google-button';
import { entityCreateStoreSelectors } from 'stores/Create';
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
    const { options } = uischema;
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const provider = options ? options[Options.oauthProvider] : NO_PROVIDER;

    const onError = (error_: any) => {
        setErrorMessage(error_);
    };

    const onSuccess = async (payload: any) => {
        const tokenResponse = await accessToken(payload.state, payload.code);

        if (tokenResponse.error) {
            setErrorMessage(tokenResponse.error.message);
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

    const useEntityCreateStore = useRouteStore();
    const imageTag = useEntityCreateStore(
        entityCreateStoreSelectors.details.connectorTag
    );

    const openPopUp = async () => {
        const fetchAuthURL = await authURL(imageTag.connectorId);

        if (fetchAuthURL.error) {
            setErrorMessage(fetchAuthURL.error.message);
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
            {hasLength(errorMessage) ? (
                <Alert severity="error">{errorMessage}</Alert>
            ) : null}

            <Typography>
                Authenticate your {` ${provider} `} account by clicking below. A
                pop up will open and you can approve access on the
                provider&apos; site. No data will be accessed during
                authorization.
            </Typography>

            <Stack direction="row" spacing={2}>
                <Alert severity="warning">
                    Under Development - do not use in prod
                </Alert>
                {provider === 'google' ? (
                    <GoogleButton disabled={loading} onClick={openPopUp} />
                ) : null}
                {!isEmpty(data) ? (
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

import { RankedTester, rankWith } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { Alert } from '@mui/material';
import { accessToken, authURL } from 'api/oauth';
import { optionExists } from 'forms/renderers/Overrides/testers/testers';
import { useOAuth2 } from 'hooks/forks/react-use-oauth2/components';
import { isEmpty } from 'lodash';
import GoogleButton from 'react-google-button';
import { Options } from 'types/jsonforms';

export const oAuthProviderTester: RankedTester = rankWith(
    1000,
    optionExists(Options.oauthProvider)
);

// This is blank on purpose. For right now we can just show null settings are nothing
const OAuthproviderRenderer = (props: any) => {
    const { data, path, handleChange, uischema } = props;
    const { options } = uischema;
    const provider = options[Options.oauthProvider];

    const onError = (error_: any) => {
        console.log('Error', error_);
    };

    const onSuccess = async (payload: any) => {
        const tokenResponse = await accessToken(payload.state, payload.code);

        if (tokenResponse.error) {
            console.log('failed access token call', tokenResponse.error);
        } else if (tokenResponse.data) {
            handleChange(path, tokenResponse.data);
        }
    };

    const { loading, error, getAuth } = useOAuth2({
        onSuccess,
        onError,
    });

    const openPopUp = async () => {
        const fetchAuthURL = await authURL('06:dc:4a:f6:f0:00:5c:00');

        if (fetchAuthURL.error) {
            console.log('fail', fetchAuthURL.error);
        } else if (fetchAuthURL.data) {
            const authProperties = getAuth(
                fetchAuthURL.data.url,
                fetchAuthURL.data.state
            );
            console.log('fetching done', authProperties);
        }
    };

    console.log({ loading, error, getAuth });
    console.log('oauth data', data);

    return (
        <>
            {!isEmpty(data) ? (
                <Alert severity="success">Authenticated</Alert>
            ) : null}
            Use the button below to enable OAuth
            {provider === 'google' ? (
                <GoogleButton disabled={loading} onClick={openPopUp} />
            ) : null}
        </>
    );
};

export const OAuthType = withJsonFormsControlProps(OAuthproviderRenderer);

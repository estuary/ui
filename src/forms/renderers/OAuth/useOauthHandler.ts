import { useState } from 'react';

import { isEmpty } from 'lodash';
import { useIntl } from 'react-intl';

import { accessToken, authURL } from 'api/oauth';

import { useOAuth2 } from 'hooks/forks/react-use-oauth2/components';

import { useDetailsForm_connectorImage_connectorId } from 'stores/DetailsForm/hooks';
import { useEndpointConfigStore_endpointConfig_data } from 'stores/EndpointConfig/hooks';

import { CREDENTIALS, INJECTED_VALUES } from './shared';

// Hook for OAuth popup opening, error handling, error message setting, etc.
export const useOauthHandler = (
    provider: string | undefined,
    successHandler: (tokenResponse: any) => void
) => {
    const intl = useIntl();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const endpointConfigData = useEndpointConfigStore_endpointConfig_data();
    const connectorId = useDetailsForm_connectorImage_connectorId();

    // handler for the useOauth stuff
    const onError = (error: any) => {
        if (error === 'access_denied') {
            setErrorMessage(
                intl.formatMessage(
                    {
                        id: 'oauth.authentication.denied',
                    },
                    { provider }
                )
            );
        } else {
            setErrorMessage(error);
        }
    };

    // handler for the useOauth stuff
    const onSuccess = async (payload: any, codeVerifier: string) => {
        const preparedData = endpointConfigData;
        preparedData[CREDENTIALS] = {
            ...endpointConfigData[CREDENTIALS],
            ...INJECTED_VALUES,
        };

        const tokenResponse = await accessToken(
            payload.state,
            payload.code,
            preparedData,
            codeVerifier
        );

        if (tokenResponse.error) {
            setErrorMessage(
                intl.formatMessage(
                    { id: 'oauth.accessToken.error' },
                    { provider }
                )
            );
        } else if (isEmpty(tokenResponse.data)) {
            setErrorMessage(
                intl.formatMessage(
                    { id: 'oauth.emptyData.error' },
                    { provider }
                )
            );
        } else {
            successHandler(tokenResponse);
        }
    };

    // This does not make the call - just wiring stuff up and getting
    //      a function/state to use
    const { loading, getAuth } = useOAuth2({
        onSuccess,
        onError,
    });

    const openPopUp = async () => {
        setErrorMessage(null);

        // Make the call to know what pop url to open
        const fetchAuthURL = await authURL(connectorId, endpointConfigData);

        if (fetchAuthURL.error) {
            setErrorMessage(
                intl.formatMessage({ id: 'oauth.fetchAuthURL.error' })
            );
        } else if (!isEmpty(fetchAuthURL.data)) {
            // This kicks off the call and the success is handled with the onSuccess/onError
            getAuth(
                fetchAuthURL.data.url,
                fetchAuthURL.data.state,
                fetchAuthURL.data.code_verifier
            );
        }
    };

    return {
        errorMessage,
        openPopUp,
        loading,
    };
};

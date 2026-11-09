import { useCallback, useMemo, useState } from 'react';

import { isEmpty } from 'lodash';
import { useBeforeUnload } from 'react-use';

import { accessToken, authURL } from 'src/api/oauth';
import { CREDENTIALS, INJECTED_VALUES } from 'src/forms/renderers/OAuth/shared';
import { useOAuth2 } from 'src/hooks/forks/react-use-oauth2/components';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEndpointConfigStore_endpointConfig_data } from 'src/stores/EndpointConfig/hooks';

// Hook for OAuth popup opening, error handling, error message setting, etc.
export const useOauthHandler = (
    provider: string | undefined,
    successHandler: (tokenResponse: any) => void
) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const endpointConfigData = useEndpointConfigStore_endpointConfig_data();
    const connectorId = useDetailsFormStore(
        (state) => state.details.data.connectorImage.connectorId
    );

    // handler for the useOauth stuff
    const onError = useCallback(
        (error: any) => {
            if (error === 'access_denied') {
                setErrorMessage(
                    `To use OAuth as your authentication you must allow our app access to your ${provider ?? ''} account.`
                );
            } else {
                setErrorMessage(error);
            }
        },
        [provider]
    );

    // handler for the useOauth stuff
    const onSuccess = useCallback(
        async (payload: any, codeVerifier: string) => {
            const preparedData = endpointConfigData;
            preparedData[CREDENTIALS] = {
                ...endpointConfigData[CREDENTIALS],
                ...INJECTED_VALUES,
            };

            logRocketEvent(CustomEvents.OAUTH_WINDOW_OPENING, {
                configKeys: Object.keys(endpointConfigData),
                preparedData: Object.keys(preparedData),
            });

            const tokenResponse = await accessToken(
                payload.state,
                payload.code,
                preparedData,
                codeVerifier
            );

            if (tokenResponse.error) {
                setErrorMessage(
                    `There was an issue attempting to get the access token from ${provider ?? ''}. Try again and if the issue persists please contact support.`
                );
            } else if (isEmpty(tokenResponse.data)) {
                setErrorMessage(
                    `We failed to get the data we need to populate the ${provider ?? ''} OAuth configuration. Try again and if the issue persists please contact support.`
                );
            } else {
                successHandler(tokenResponse);
            }
        },
        [endpointConfigData, provider, successHandler]
    );

    // This does not make the call - just wiring stuff up and getting
    //      a function/state to use
    const { loading, getAuth } = useOAuth2({
        onSuccess,
        onError,
    });

    const openPopUp = useCallback(async () => {
        setErrorMessage(null);

        // Make the call to know what pop url to open
        const fetchAuthURL = await authURL(connectorId, endpointConfigData);

        if (fetchAuthURL.error) {
            setErrorMessage(
                'We failed to fetch the proper URL to start OAuth. Try again and if the issue persists please contact support.'
            );
        } else if (!isEmpty(fetchAuthURL.data)) {
            // This kicks off the call and the success is handled with the onSuccess/onError
            getAuth(
                fetchAuthURL.data.url,
                fetchAuthURL.data.state,
                fetchAuthURL.data.code_verifier
            );
        }
    }, [connectorId, endpointConfigData, getAuth]);

    // Loading usually means there is an OAuth in progress so make sure
    //  they want to close the window.
    const when = useCallback(() => {
        return loading;
    }, [loading]);
    useBeforeUnload(
        when,
        'You are in the process of OAuth. If you continue, you will lose your changes.'
    );

    return useMemo(
        () => ({
            errorMessage,
            openPopUp,
            loading,
        }),
        [errorMessage, loading, openPopUp]
    );
};

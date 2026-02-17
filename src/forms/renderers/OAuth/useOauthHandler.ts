import { useCallback, useMemo, useState } from 'react';

import { isEmpty } from 'lodash';
import { useIntl } from 'react-intl';
import { useBeforeUnload } from 'react-use';

import { accessToken, authURL } from 'src/api/oauth';
import { buildVirtualConfig } from 'src/forms/renderers/OAuth/buildVirtualConfig';
import { CREDENTIALS, INJECTED_VALUES } from 'src/forms/renderers/OAuth/shared';
import { useOAuth2 } from 'src/hooks/forks/react-use-oauth2/components';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEndpointConfigStore_endpointConfig_data } from 'src/stores/EndpointConfig/hooks';

// Hook for OAuth popup opening, error handling, error message setting, etc.
export const useOauthHandler = (
    provider: string | undefined,
    successHandler: (tokenResponse: any) => void,
    credentialsPath: string
) => {
    const intl = useIntl();
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
        },
        [intl, provider]
    );

    // handler for the useOauth stuff
    const onSuccess = useCallback(
        async (payload: any, codeVerifier: string) => {
            const virtualConfig = buildVirtualConfig(
                endpointConfigData,
                credentialsPath
            );
            const preparedData = { ...virtualConfig };
            preparedData[CREDENTIALS] = {
                ...virtualConfig[CREDENTIALS],
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
        },
        [credentialsPath, endpointConfigData, intl, provider, successHandler]
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
        const virtualConfig = buildVirtualConfig(
            endpointConfigData,
            credentialsPath
        );
        const fetchAuthURL = await authURL(connectorId, virtualConfig);

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
    }, [connectorId, credentialsPath, endpointConfigData, getAuth, intl]);

    // Loading usually means there is an OAuth in progress so make sure
    //  they want to close the window.
    const when = useCallback(() => {
        return loading;
    }, [loading]);
    useBeforeUnload(when, intl.formatMessage({ id: 'confirm.oauth' }));

    return useMemo(
        () => ({
            errorMessage,
            openPopUp,
            loading,
        }),
        [errorMessage, loading, openPopUp]
    );
};

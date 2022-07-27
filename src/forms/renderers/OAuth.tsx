import { RankedTester, rankWith } from '@jsonforms/core';
import { withJsonFormsLayoutProps } from '@jsonforms/react';
import { authURL } from 'api/oauth';
import OAuthRequest from 'forms/renderers/OAuth/Request';
import { optionExists } from 'forms/renderers/Overrides/testers/testers';
import { useState } from 'react';
import GoogleButton from 'react-google-button';
import { useAsync } from 'react-use';
import { Options } from 'types/jsonforms';
import { hasLength } from 'utils/misc-utils';

export const oAuthProviderTester: RankedTester = rankWith(
    1000,
    optionExists(Options.oauthProvider)
);

// This is blank on purpose. For right now we can just show null settings are nothing
const OAuthproviderRenderer = (props: any) => {
    const { uischema } = props;
    const { options } = uischema;
    const provider = options[Options.oauthProvider];
    const [authUrlResponse, setAuthUrlResponse] = useState<string | null>(null);
    const [displayOAuthPopUp, setDisplayOAuthPopUp] = useState(false);

    useAsync(async () => {
        const fetchAuthURL = await authURL('06:dc:4a:f6:f0:00:5c:00');

        if (fetchAuthURL.error) {
            console.log('fail');
            return;
        }

        setAuthUrlResponse(fetchAuthURL.data.url);
    }, [provider]);

    return (
        <>
            Use the button below to enable OAuth
            {provider === 'google' ? (
                <GoogleButton onClick={() => setDisplayOAuthPopUp(true)} />
            ) : null}
            {displayOAuthPopUp && hasLength(authUrlResponse) ? (
                <OAuthRequest url={authUrlResponse ?? ''} />
            ) : null}
        </>
    );
};

export const OAuthType = withJsonFormsLayoutProps(OAuthproviderRenderer);

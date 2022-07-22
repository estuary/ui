import { RankedTester, rankWith } from '@jsonforms/core';
import { withJsonFormsLayoutProps } from '@jsonforms/react';
import { authURL } from 'api/oauth';
import { optionExists } from 'forms/renderers/Overrides/testers/testers';
import GoogleButton from 'react-google-button';
import { Options } from 'types/jsonforms';

export const oAuthProviderTester: RankedTester = rankWith(
    1000,
    optionExists(Options.oauthProvider)
);

// This is blank on purpose. For right now we can just show null settings are nothing
const OAuthproviderRenderer = (props: any) => {
    const { uischema } = props;
    const { options } = uischema;
    const provider = options[Options.oauthProvider];

    const handleClick = async () => {
        const fetchAuthURL = await authURL('06:cf:74:4d:07:00:5c:00');

        if (fetchAuthURL.error) {
            console.log('fail');
            return;
        }

        console.log('success', fetchAuthURL.data);
    };

    return (
        <>
            Use the button below to enable OAuth
            {provider === 'google' ? (
                <GoogleButton onClick={handleClick} />
            ) : null}
        </>
    );
};

export const OAuthType = withJsonFormsLayoutProps(OAuthproviderRenderer);

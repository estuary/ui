import { SSOForm } from 'src/components/login/SSO';
import { SSORedirect } from 'src/components/login/SSO/SSORedirect';
import useLoginStateHandler from 'src/hooks/login/useLoginStateHandler';
import useBrowserTitle from 'src/hooks/useBrowserTitle';
import LoginWrapper from 'src/pages/login/Wrapper';

const titleKey = 'routeTitle.login.sso';
const ogDescriptionKey = `${titleKey}.description`;

const EnterpriseLogin = () => {
    useBrowserTitle('routeTitle.login.sso', 'routeTitle.login.sso.prefix', {
        descriptionKey: ogDescriptionKey,
    });

    const { grantToken, ssoProviderId, isRegister, tabIndex } =
        useLoginStateHandler(false);

    return (
        <LoginWrapper tabIndex={tabIndex} isRegister={isRegister} showBack>
            {ssoProviderId ? (
                <SSORedirect
                    grantToken={grantToken}
                    ssoProviderId={ssoProviderId}
                />
            ) : (
                <SSOForm grantToken={grantToken} />
            )}
        </LoginWrapper>
    );
};

export default EnterpriseLogin;

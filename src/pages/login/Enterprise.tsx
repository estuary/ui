import LoginWrapper from './Wrapper';

import SSOForm from 'src/components/login/SSO';
import useLoginStateHandler from 'src/hooks/login/useLoginStateHandler';
import useBrowserTitle from 'src/hooks/useBrowserTitle';

const titleKey = 'routeTitle.login.sso';
const ogDescriptionKey = `${titleKey}.description`;

const EnterpriseLogin = () => {
    useBrowserTitle('routeTitle.login.sso', 'routeTitle.login.sso.prefix', {
        descriptionKey: ogDescriptionKey,
    });

    const { grantToken, isRegister, tabIndex } = useLoginStateHandler(false);

    return (
        <LoginWrapper tabIndex={tabIndex} isRegister={isRegister} showBack>
            <SSOForm grantToken={grantToken} />
        </LoginWrapper>
    );
};

export default EnterpriseLogin;

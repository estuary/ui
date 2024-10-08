import SSOForm from 'components/login/SSO';
import useLoginStateHandler from 'hooks/login/useLoginStateHandler';
import useBrowserTitle from 'hooks/useBrowserTitle';
import LoginWrapper from './Wrapper';

const titleKey = 'routeTitle.login.sso';
const prefixKey = `${titleKey}.prefix`;
const ogDescriptionKey = `${titleKey}.description`;
const metaTitleKey = `${titleKey}.ogTitle`;

const EnterpriseLogin = () => {
    useBrowserTitle(titleKey, prefixKey, {
        ogDescriptionKey,
        ogTitleKey: metaTitleKey,
    });

    const { grantToken, isRegister, tabIndex } = useLoginStateHandler(false);

    return (
        <LoginWrapper tabIndex={tabIndex} isRegister={isRegister} showBack>
            <SSOForm grantToken={grantToken} />
        </LoginWrapper>
    );
};

export default EnterpriseLogin;

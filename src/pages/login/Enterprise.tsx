import SSOForm from 'components/login/SSO';
import useLoginStateHandler from 'hooks/login/useLoginStateHandler';
import useBrowserTitle from 'hooks/useBrowserTitle';
import LoginWrapper from './Wrapper';

const titleKey = 'routeTitle.login.sso';
const prefixKey = `${titleKey}.prefix`;
const descriptionKey = `${titleKey}.description`;
const metaTitleKey = `${titleKey}.metaTitle`;

const EnterpriseLogin = () => {
    useBrowserTitle(titleKey, prefixKey, {
        descriptionKey,
        metaTitleKey,
    });

    const { grantToken, isRegister, tabIndex } = useLoginStateHandler(false);

    return (
        <LoginWrapper tabIndex={tabIndex} isRegister={isRegister} showBack>
            <SSOForm grantToken={grantToken} />
        </LoginWrapper>
    );
};

export default EnterpriseLogin;

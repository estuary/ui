import SSOForm from 'components/login/SSO';
import useLoginStateHandler from 'hooks/login/useLoginStateHandler';
import useBrowserTitle from 'hooks/useBrowserTitle';
import LoginWrapper from './Wrapper';

const EnterpriseLogin = () => {
    useBrowserTitle('routeTitle.login');

    const { grantToken, isRegister, tabIndex } = useLoginStateHandler(false);

    return (
        <LoginWrapper tabIndex={tabIndex} isRegister={isRegister} showBack>
            <SSOForm grantToken={grantToken} />
        </LoginWrapper>
    );
};

export default EnterpriseLogin;

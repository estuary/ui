import SSOForm from 'components/login/SSO';
import useLoginStateHandler from 'hooks/login/useLoginStateHandler';
import useBrowserTitle from 'hooks/useBrowserTitle';
import PageNotFound from 'pages/error/PageNotFound';
import { getLoginSettings } from 'utils/env-utils';
import LoginWrapper from './Wrapper';

const { showSSO } = getLoginSettings();

const EnterpriseLogin = () => {
    useBrowserTitle('routeTitle.login');

    const { grantToken, isRegister, tabIndex } = useLoginStateHandler(false);

    if (!showSSO) {
        return <PageNotFound />;
    }

    return (
        <LoginWrapper tabIndex={tabIndex} isRegister={isRegister}>
            <SSOForm grantToken={grantToken} />
        </LoginWrapper>
    );
};

export default EnterpriseLogin;

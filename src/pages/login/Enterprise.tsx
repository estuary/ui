import FullPageError from 'components/fullPage/Error';
import SSOForm from 'components/login/SSO';
import useLoginStateHandler from 'hooks/login/useLoginStateHandler';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';
import { getLoginSettings } from 'utils/env-utils';
import LoginWrapper from './Wrapper';

const { showSSO } = getLoginSettings();

const EnterpriseLogin = () => {
    useBrowserTitle('routeTitle.login');

    const { grantToken, isRegister, tabIndex } = useLoginStateHandler(false);

    if (!showSSO) {
        return (
            <FullPageError
                error={<FormattedMessage id="login.sso.disabled" />}
            />
        );
    }

    return (
        <LoginWrapper tabIndex={tabIndex} isRegister={isRegister} showBack>
            <SSOForm grantToken={grantToken} />
        </LoginWrapper>
    );
};

export default EnterpriseLogin;

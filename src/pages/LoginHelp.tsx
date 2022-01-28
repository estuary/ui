import PageContainer from 'components/shared/PageContainer';
import { FormattedMessage } from 'react-intl';

const LoginHelp: React.FC = () => {
    return (
        <PageContainer>
            <FormattedMessage id="loginHelp.header" />
        </PageContainer>
    );
};

export default LoginHelp;

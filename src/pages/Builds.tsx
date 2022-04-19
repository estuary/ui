import PageContainer from 'components/shared/PageContainer';
import { useIntl } from 'react-intl';
import { useTitle } from 'react-use';

const Builds = () => {
    const intl = useIntl();
    useTitle(
        intl.formatMessage({
            id: 'browserTitle.builds',
        })
    );

    return (
        <PageContainer>There was a table here. It is gone now.</PageContainer>
    );
};

export default Builds;

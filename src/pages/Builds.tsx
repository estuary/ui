import PageContainer from 'components/shared/PageContainer';
import EntityTable from 'components/tables/EntityTable';
import { useIntl } from 'react-intl';
import { useTitle } from 'react-use';

const Builds = () => {
    const intl = useIntl();
    useTitle(
        intl.formatMessage({
            id: 'title.builds',
        })
    );

    return (
        <PageContainer>
            <EntityTable
                noExistingDataContentIds={{
                    header: 'captures.main.message1',
                    message: 'captures.main.message2',
                    docLink: 'captures.main.message2.docLink',
                    docPath: 'captures.main.message2.docPath',
                }}
            />
        </PageContainer>
    );
};

export default Builds;

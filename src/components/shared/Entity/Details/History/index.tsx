import ListAndDetails from 'src/components/editor/ListAndDetails';
import CardWrapper from 'src/components/shared/CardWrapper';
import DiffViewer from 'src/components/shared/Entity/Details/History/DiffViewer';
import PublicationList from 'src/components/shared/Entity/Details/History/PublicationList';
import { HEIGHT } from 'src/components/shared/Entity/Details/History/shared';
import { getEditorTotalHeight } from 'src/utils/editor-utils';

function History() {
    return (
        <CardWrapper message="Change History">
            <ListAndDetails
                displayBorder
                height={getEditorTotalHeight(HEIGHT)}
                list={<PublicationList />}
                details={<DiffViewer />}
            />
        </CardWrapper>
    );
}

export default History;

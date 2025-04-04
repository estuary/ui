import { Box } from '@mui/material';

import ListAndDetails from 'src/components/editor/ListAndDetails';
import DiffViewer from 'src/components/shared/Entity/Details/History/DiffViewer';
import PublicationList from 'src/components/shared/Entity/Details/History/PublicationList';
import { HEIGHT } from 'src/components/shared/Entity/Details/History/shared';
import UnderDev from 'src/components/shared/UnderDev';
import { getEditorTotalHeight } from 'src/utils/editor-utils';

function History() {
    return (
        <Box>
            <UnderDev />
            <ListAndDetails
                displayBorder
                height={getEditorTotalHeight(HEIGHT)}
                list={<PublicationList />}
                details={<DiffViewer />}
            />
        </Box>
    );
}

export default History;

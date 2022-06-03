import { Paper, Typography } from '@mui/material';
import DraftSpecEditor from 'components/editor/DraftSpec';
import { EditorStoreState } from 'components/editor/Store';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { FormattedMessage } from 'react-intl';
import { entityCreateStoreSelectors } from 'stores/Create';

interface Props {
    messageId: string;
}

function CatalogEditor({ messageId }: Props) {
    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >((state) => state.id);

    const useEntityCreateStore = useRouteStore();
    const formActive = useEntityCreateStore(
        entityCreateStoreSelectors.isActive
    );

    if (draftId) {
        return (
            <WrapperWithHeader
                header={<FormattedMessage id="foo.catalogEditor.heading" />}
            >
                <>
                    <Typography sx={{ mb: 2 }}>
                        <FormattedMessage id={messageId} />
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 1 }}>
                        <DraftSpecEditor disabled={formActive} />
                    </Paper>
                </>
            </WrapperWithHeader>
        );
    } else {
        return null;
    }
}

export default CatalogEditor;

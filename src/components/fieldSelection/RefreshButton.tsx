import { Box, Button } from '@mui/material';

import { Refresh } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import { useEditorStore_persistedDraftId } from 'src/components/editor/Store/hooks';
import useFieldSelectionRefresh from 'src/hooks/fieldSelection/useFieldSelectionRefresh';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

interface Props {
    buttonLabelId: string;
    disabled?: boolean;
}

function RefreshButton({ disabled, buttonLabelId }: Props) {
    const { updating, refresh } = useFieldSelectionRefresh();

    const persistedDraftId = useEditorStore_persistedDraftId();

    return (
        <Box>
            <Button
                disabled={Boolean(updating || disabled || !persistedDraftId)}
                startIcon={<Refresh style={{ fontSize: 12 }} />}
                variant="text"
                onClick={async () => {
                    logRocketEvent(CustomEvents.FIELD_SELECTION_REFRESH_MANUAL);
                    await refresh();
                }}
            >
                <FormattedMessage id={buttonLabelId} />
            </Button>
        </Box>
    );
}
export default RefreshButton;

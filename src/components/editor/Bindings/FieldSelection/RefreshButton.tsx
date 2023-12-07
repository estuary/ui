import { Box, Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { Refresh } from 'iconoir-react';
import useFieldSelectionRefresh from './useFieldSelectionRefresh';

interface Props {
    buttonLabelId: string;
    disabled?: boolean;
}

function RefreshButton({ disabled, buttonLabelId }: Props) {
    const { updating, refresh } = useFieldSelectionRefresh();

    return (
        <Box>
            <Button
                disabled={Boolean(updating || disabled)}
                startIcon={<Refresh style={{ fontSize: 12 }} />}
                variant="text"
                onClick={async () => {
                    await refresh();
                }}
            >
                <FormattedMessage id={buttonLabelId} />
            </Button>
        </Box>
    );
}
export default RefreshButton;

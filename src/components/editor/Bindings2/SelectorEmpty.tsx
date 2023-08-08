import { Box } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { FormattedMessage } from 'react-intl';

function SelectorEmpty() {
    return (
        <Box sx={{ pt: 1, px: 1 }}>
            <AlertBox
                severity="info"
                short
                title={
                    <FormattedMessage id="entityCreate.bindingsConfig.noRowsTitle" />
                }
            >
                <FormattedMessage id="entityCreate.bindingsConfig.noRows" />
            </AlertBox>
        </Box>
    );
}

export default SelectorEmpty;

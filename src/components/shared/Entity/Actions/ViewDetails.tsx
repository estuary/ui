import { Button } from '@mui/material';

import useEntityWorkflowHelpers from '../hooks/useEntityWorkflowHelpers';
import { FormattedMessage } from 'react-intl';

import { entityHeaderButtonSx } from 'src/context/Theme';

function EntityViewDetails() {
    const { exit } = useEntityWorkflowHelpers();

    return (
        <Button
            onClick={async (event) => {
                event.preventDefault();
                exit();
            }}
            sx={entityHeaderButtonSx}
        >
            <FormattedMessage id="cta.goToDetails" />
        </Button>
    );
}

export default EntityViewDetails;

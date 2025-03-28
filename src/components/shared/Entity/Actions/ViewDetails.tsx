import { Button } from '@mui/material';
import { entityHeaderButtonSx } from 'src/context/Theme';

import { FormattedMessage } from 'react-intl';

import useEntityWorkflowHelpers from '../hooks/useEntityWorkflowHelpers';

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

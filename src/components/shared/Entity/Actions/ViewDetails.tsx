import { Button } from '@mui/material';

import { buttonSx } from 'components/shared/Entity/Header';
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
            sx={buttonSx}
        >
            <FormattedMessage id="cta.goToDetails" />
        </Button>
    );
}

export default EntityViewDetails;

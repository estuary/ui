import { Button } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { entityHeaderButtonSx } from 'src/context/Theme';
import useEntityWorkflowHelpers from 'src/components/shared/Entity/hooks/useEntityWorkflowHelpers';

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

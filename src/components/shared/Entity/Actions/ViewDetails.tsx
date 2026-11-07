import { Button } from '@mui/material';

import useEntityWorkflowHelpers from 'src/components/shared/Entity/hooks/useEntityWorkflowHelpers';
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
            See Details
        </Button>
    );
}

export default EntityViewDetails;

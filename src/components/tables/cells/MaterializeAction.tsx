import { FormattedMessage } from 'react-intl';

import { Button } from '@mui/material';

interface Props {
    onClick?: any;
    disabled?: boolean;
}

function MaterializeAction({ onClick, disabled }: Props) {
    return (
        <Button
            size="small"
            disabled={disabled}
            onClick={onClick}
            sx={{ mr: 1 }}
        >
            <FormattedMessage id="capturesTable.cta.materialize" />
        </Button>
    );
}

export default MaterializeAction;

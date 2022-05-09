import { Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    onClick?: any;
    disabled?: boolean;
}

function MaterializeAction({ onClick, disabled }: Props) {
    return (
        <Button
            variant="contained"
            size="small"
            disableElevation
            sx={{ mr: 1 }}
            disabled={disabled}
            onClick={onClick}
        >
            <FormattedMessage id="capturesTable.cta.materialize" />
        </Button>
    );
}

export default MaterializeAction;

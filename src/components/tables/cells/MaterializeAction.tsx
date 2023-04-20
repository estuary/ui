import { Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    disabled?: boolean;
    onClick?: any;
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

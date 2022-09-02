import { Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    clickHandler: () => void;
}

function EditTask({ clickHandler }: Props) {
    return (
        <Button
            variant="text"
            size="small"
            disableElevation
            onClick={clickHandler}
            sx={{ mr: 1 }}
        >
            <FormattedMessage id="cta.edit" />
        </Button>
    );
}

export default EditTask;

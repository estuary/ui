import { FormattedMessage } from 'react-intl';

import { Button } from '@mui/material';

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

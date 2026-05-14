import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

const AddButton = () => {
    const intl = useIntl();

    return (
        <Button variant="text">
            {intl.formatMessage({
                id: 'alerts.config.dialog.cta.addSubscriber',
            })}
        </Button>
    );
};

export default AddButton;

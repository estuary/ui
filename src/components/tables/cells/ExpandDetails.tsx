import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    onClick?: any;
    disabled?: boolean;
    expanded?: boolean;
    messageId?: string;
}

function ExpandDetails({
    onClick,
    disabled,
    expanded,
    messageId = 'cta.details',
}: Props) {
    return (
        <Button
            variant="text"
            size="small"
            disableElevation
            sx={{ mr: 1 }}
            disabled={disabled}
            onClick={onClick}
            endIcon={
                // TODO (duplication) this is copied a few times
                <KeyboardArrowDownIcon
                    sx={{
                        marginRight: 0,
                        transform: `rotate(${expanded ? '180' : '0'}deg)`,
                        transition: 'all 250ms ease-in-out',
                    }}
                />
            }
        >
            <FormattedMessage id={messageId} />
        </Button>
    );
}

export default ExpandDetails;

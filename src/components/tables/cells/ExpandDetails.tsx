import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Button } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    onClick?: any;
    disabled?: boolean;
    expanded?: boolean;
}

function ExpandDetails({ onClick, disabled, expanded }: Props) {
    return (
        <Button
            variant="text"
            size="small"
            disableElevation
            sx={{ mr: 1 }}
            disabled={disabled}
            onClick={(event: any) => {
                event.stopPropagation();
                onClick();
            }}
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
            <FormattedMessage id="cta.details" />
        </Button>
    );
}

export default ExpandDetails;

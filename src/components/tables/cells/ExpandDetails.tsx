import { Button } from '@mui/material';
import { NavArrowDown } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

interface Props {
    disabled?: boolean;
    expanded?: boolean;
    messageId?: string;
    onClick?: any;
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
            onClick={(event: any) => {
                event.stopPropagation();
                onClick();
            }}
            endIcon={
                // TODO (duplication) this is copied a few times
                <NavArrowDown
                    style={{
                        marginRight: 0,
                        fontSize: 14,
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

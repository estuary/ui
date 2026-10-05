import { Button } from '@mui/material';

import { NavArrowDown } from 'iconoir-react';
import { useIntl } from 'react-intl';

interface Props {
    onClick?: any;
    disabled?: boolean;
    expanded?: boolean;
    message?: string;
}

export function ExpandDetails({ onClick, disabled, expanded, message }: Props) {
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
            {message}
        </Button>
    );
}

/** @deprecated Prefer the named `ExpandDetails` export */
function ExpandDetailsWrapper({
    messageId = 'cta.details',
    ...props
}: Omit<Props, 'message'> & { messageId?: string }) {
    const intl = useIntl();

    return (
        <ExpandDetails
            {...props}
            message={intl.formatMessage({ id: messageId })}
        />
    );
}

export default ExpandDetailsWrapper;

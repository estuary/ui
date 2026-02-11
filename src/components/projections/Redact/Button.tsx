import type { BaseRedactFieldProps } from 'src/components/projections/types';

import { useState } from 'react';

import { Button, Tooltip } from '@mui/material';

import { useIntl } from 'react-intl';

import RedactFieldDialog from 'src/components/projections/Redact/Dialog';
import { checkRedactionPointer } from 'src/utils/schema-utils';

const RedactFieldButton = ({
    disabled,
    field,
    pointer,
    strategy,
}: BaseRedactFieldProps) => {
    const intl = useIntl();

    const [open, setOpen] = useState(false);

    const redactionStatus = checkRedactionPointer(pointer);

    // Determine tooltip message based on redaction status
    let tooltipMessage = '';
    if (redactionStatus === 'prevent') {
        tooltipMessage = intl.formatMessage({
            id: 'projection.cta.redact.prevent',
        });
    }

    return (
        <>
            <Tooltip title={tooltipMessage} placement="top">
                <span>
                    <Button
                        disabled={Boolean(
                            disabled || redactionStatus === 'prevent'
                        )}
                        onClick={(event: React.MouseEvent<HTMLElement>) => {
                            event.preventDefault();

                            setOpen(true);
                        }}
                        size="small"
                        variant="outlined"
                    >
                        {intl.formatMessage({ id: 'cta.redact' })}
                    </Button>
                </span>
            </Tooltip>

            <RedactFieldDialog
                field={field}
                open={open}
                pointer={pointer}
                setOpen={setOpen}
                strategy={strategy}
            />
        </>
    );
};

export default RedactFieldButton;

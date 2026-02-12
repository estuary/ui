import type { BaseRedactFieldProps } from 'src/components/projections/types';

import { useState } from 'react';

import { Button, Tooltip } from '@mui/material';

import { useIntl } from 'react-intl';

import RedactFieldDialog from 'src/components/projections/Redact/Dialog';
import { evaluateRedactionEligibility } from 'src/utils/schema-utils';

const RedactFieldButton = ({
    disabled,
    field,
    pointer,
    strategy,
}: BaseRedactFieldProps) => {
    const intl = useIntl();

    const [open, setOpen] = useState(false);

    const redactionEligibility = evaluateRedactionEligibility(pointer);

    // Determine tooltip message based on redaction status
    let tooltipMessage = '';
    if (redactionEligibility === 'prevent') {
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
                            disabled || redactionEligibility === 'prevent'
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

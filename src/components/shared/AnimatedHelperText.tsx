import { useState } from 'react';

import { Collapse, FormHelperText } from '@mui/material';

interface AnimatedHelperTextProps {
    error?: boolean;
    message: string | undefined;
}

export function AnimatedHelperText({ error, message }: AnimatedHelperTextProps) {
    const [persistedMessage, setPersistedMessage] = useState(message);

    if (message && message !== persistedMessage) {
        setPersistedMessage(message);
    }

    return (
        <Collapse in={!!message} onExited={() => setPersistedMessage(undefined)}>
            <FormHelperText error={error}>
                {persistedMessage}
            </FormHelperText>
        </Collapse>
    );
}

import type { RedactSaveButtonProps } from 'src/components/projections/types';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import { useRedactionAnnotation } from 'src/hooks/projections/useRedactionAnnotation';

const SaveButton = ({ field, setOpen, strategy }: RedactSaveButtonProps) => {
    const intl = useIntl();

    const { updateRedactionAnnotation } = useRedactionAnnotation();

    return (
        <Button
            onClick={() => {
                updateRedactionAnnotation(field, strategy).then(
                    () => {
                        setOpen(false);
                    },
                    () => {}
                );
                setOpen(false);
            }}
            variant="outlined"
        >
            {intl.formatMessage({
                id: 'cta.evolve',
            })}
        </Button>
    );
};

export default SaveButton;

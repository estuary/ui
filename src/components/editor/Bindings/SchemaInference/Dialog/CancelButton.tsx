import { Button } from '@mui/material';
import { useBindingsEditorStore_setInferredSchemaApplicationErrored } from 'components/editor/Bindings/Store/hooks';
import {
    secondaryButtonBackground,
    secondaryButtonHoverBackground,
} from 'context/Theme';
import { Dispatch, SetStateAction } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    setOpen: Dispatch<SetStateAction<boolean>>;
}

function CancelButton({ setOpen }: Props) {
    // Bindings Editor Store
    const setInferredSchemaApplicationErrored =
        useBindingsEditorStore_setInferredSchemaApplicationErrored();

    const closeConfirmationDialog = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setOpen(false);

        setInferredSchemaApplicationErrored(false);
    };

    return (
        <Button
            onClick={closeConfirmationDialog}
            sx={{
                'backgroundColor': (theme) =>
                    secondaryButtonBackground[theme.palette.mode],
                '&:hover': {
                    backgroundColor: (theme) =>
                        secondaryButtonHoverBackground[theme.palette.mode],
                },
            }}
        >
            <FormattedMessage id="cta.cancel" />
        </Button>
    );
}

export default CancelButton;

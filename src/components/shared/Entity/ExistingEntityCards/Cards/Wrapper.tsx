import { ButtonBase } from '@mui/material';
import {
    semiTransparentBackground,
    semiTransparentBackgroundIntensified,
} from 'context/Theme';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    clickHandler: () => void;
}

const boxShadow =
    'rgb(50 50 93 / 7%) 0px 3px 6px -1px, rgb(0 0 0 / 10%) 0px -2px 4px -1px, rgb(0 0 0 / 10%) 0px 2px 4px -1px';

function EntityCardWrapper({ children, clickHandler }: Props) {
    return (
        <ButtonBase
            onClick={clickHandler}
            sx={{
                'width': '100%',
                'padding': 1,
                'justifyContent': 'flex-start',
                'background': (theme) =>
                    semiTransparentBackground[theme.palette.mode],
                boxShadow,
                'borderRadius': 3,
                '&:hover': {
                    background: (theme) =>
                        semiTransparentBackgroundIntensified[
                            theme.palette.mode
                        ],
                    boxShadow,
                },
            }}
        >
            {children}
        </ButtonBase>
    );
}

export default EntityCardWrapper;

import { BaseComponentProps } from 'types';

import { NavArrowDown } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import { AccordionSummary, Fade, Typography, useTheme } from '@mui/material';

interface Props extends BaseComponentProps {
    expanded: boolean;
    disableClose?: boolean;
    readOnly?: boolean;
}

function Header({ children, disableClose, expanded, readOnly }: Props) {
    const theme = useTheme();

    return (
        <AccordionSummary
            expandIcon={
                !disableClose ? (
                    <NavArrowDown
                        style={{ color: theme.palette.text.primary }}
                    />
                ) : undefined
            }
            sx={{
                'backgroundColor':
                    theme.palette.mode === 'dark' ? 'transparent' : 'white',
                '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                },
            }}
        >
            {children}

            <Fade in={!expanded}>
                <Typography sx={{ ml: 'auto', mr: 1 }}>
                    <FormattedMessage
                        id={readOnly ? 'cta.expandToView' : 'cta.expandToEdit'}
                    />
                </Typography>
            </Fade>
        </AccordionSummary>
    );
}

export default Header;

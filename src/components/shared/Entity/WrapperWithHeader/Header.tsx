import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AccordionSummary, Fade, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    expanded: boolean;
    disableClose?: boolean;
    readOnly?: boolean;
}

function Header({ children, disableClose, expanded, readOnly }: Props) {
    return (
        <AccordionSummary
            expandIcon={!disableClose ? <ExpandMoreIcon /> : undefined}
            sx={{
                'backgroundColor': (theme) =>
                    theme.palette.mode === 'dark' ? 'transparent' : 'white',
                '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                },
            }}
        >
            {children}

            <Fade in={!expanded}>
                <Typography sx={{ ml: 'auto' }}>
                    <FormattedMessage
                        id={readOnly ? 'cta.expandToView' : 'cta.expandToEdit'}
                    />
                </Typography>
            </Fade>
        </AccordionSummary>
    );
}

export default Header;

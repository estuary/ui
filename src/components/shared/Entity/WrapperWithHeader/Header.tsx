import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AccordionSummary, Fade, Typography } from '@mui/material';
import { slate } from 'context/Theme';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    expanded: boolean;
    disableClose?: boolean;
}

function Header({ children, disableClose, expanded }: Props) {
    return (
        <AccordionSummary
            expandIcon={!disableClose ? <ExpandMoreIcon /> : undefined}
            sx={{
                backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'transparent' : slate[50],
            }}
        >
            {children}
            <Fade in={!expanded}>
                <Typography
                    sx={{
                        ml: 'auto',
                    }}
                >
                    <FormattedMessage id="cta.expandToEdit" />
                </Typography>
            </Fade>
        </AccordionSummary>
    );
}

export default Header;

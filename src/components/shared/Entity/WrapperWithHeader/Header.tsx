import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AccordionSummary, Fade, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    expanded: boolean;
}

function Header({ children, expanded }: Props) {
    return (
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
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

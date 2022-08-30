import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AccordionSummary, Fade, Typography } from '@mui/material';
import { slate } from 'context/Theme';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    expanded: boolean;
    readOnly?: boolean;
}

function Header({ children, expanded, readOnly }: Props) {
    return (
        <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
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
                    <FormattedMessage
                        id={readOnly ? 'cta.expandToView' : 'cta.expandToEdit'}
                    />
                </Typography>
            </Fade>
        </AccordionSummary>
    );
}

export default Header;

import { JsonForms } from '@jsonforms/react';
import { vanillaCells, vanillaRenderers } from '@jsonforms/vanilla-renderers';
import {
    Avatar,
    Divider,
    Grid,
    styled,
    Toolbar,
    Typography,
} from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import PropTypes from 'prop-types';
import { useState } from 'react';
import AppTheme from '../AppTheme';

const SlideoutPropTypes = {
    header: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onSlideoutOpenToggle: PropTypes.func.isRequired,
};
type SlideoutProps = PropTypes.InferProps<typeof SlideoutPropTypes>;

const StyledDrawer = styled(
    MuiDrawer,
    {}
)(({ theme }) => ({
    zIndex: theme.zIndex.modal,
}));

function Slideout(props: SlideoutProps) {
    const closeSlideout = () => {
        props.onSlideoutOpenToggle();
    };

    const [jsonformsData, setJsonformsData] = useState<any>({});

    return (
        <StyledDrawer
            open={props.isOpen}
            onClose={props.onSlideoutOpenToggle}
            anchor="right"
            PaperProps={{
                sx: { width: '80%' },
            }}
        >
            <Toolbar>
                <Avatar onClick={closeSlideout}>X</Avatar>
            </Toolbar>
            <Typography variant="h2">{props.header}</Typography>
            <Divider />
            <Grid container>
                <Grid item sm={6}>
                    <AppTheme>
                        <JsonForms
                            data={jsonformsData}
                            renderers={vanillaRenderers}
                            cells={vanillaCells}
                            onChange={({ data }) => setJsonformsData(data)}
                        />
                    </AppTheme>
                </Grid>
            </Grid>
        </StyledDrawer>
    );
}

Slideout.propTypes = SlideoutPropTypes;

export default Slideout;

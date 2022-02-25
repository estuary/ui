import { Backdrop, CircularProgress } from '@mui/material';

function FullPageSpinner() {
    return (
        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={true}
        >
            <CircularProgress color="inherit" />
        </Backdrop>
    );
}

export default FullPageSpinner;

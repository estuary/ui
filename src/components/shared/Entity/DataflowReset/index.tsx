import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    LinearProgress,
    Stack,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    useTheme,
} from '@mui/material';
import { Xmark } from 'iconoir-react';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import {
    useFormStateStore_setShowChangeReview,
    useFormStateStore_showChangeReview,
} from 'stores/FormState/hooks';
import ChangeReview from '../ChangeReview';
import BindingReview from './BindingReview';

function DataflowReset() {
    const intl = useIntl();
    const theme = useTheme();

    const showChangeReview = useFormStateStore_showChangeReview();
    const setShowChangeReview = useFormStateStore_setShowChangeReview();

    const [activeStep, setActiveStep] = useState(0);

    const closeDialog = () => {
        setActiveStep(0);

        setShowChangeReview(false);
    };
    const handleNext = () =>
        setActiveStep((prevActiveStep) => prevActiveStep + 1);

    const handleBack = () => {
        if (activeStep === 0) {
            return closeDialog();
        }
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    return (
        <Dialog
            maxWidth={activeStep === 0 ? 'lg' : 'md'}
            fullWidth
            open={showChangeReview}
            onClose={closeDialog}
        >
            <DialogTitle
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                Please review your changes
                <IconButton disabled={activeStep > 1} onClick={closeDialog}>
                    <Xmark
                        aria-label={intl.formatMessage({ id: 'cta.close' })}
                        style={{
                            fontSize: '1rem',
                            color: theme.palette.text.primary,
                        }}
                    />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Stepper orientation="vertical" activeStep={activeStep}>
                    <Step>
                        <StepLabel>Review your changes</StepLabel>
                        <StepContent>
                            <ChangeReview />
                        </StepContent>
                    </Step>
                    <Step>
                        <StepLabel>
                            Select materialization for data flow reset
                        </StepLabel>
                        <StepContent>
                            <BindingReview />
                        </StepContent>
                    </Step>
                    <Step>
                        <StepLabel>Disable capture</StepLabel>
                        <StepContent>
                            <LinearProgress />
                            Logs
                        </StepContent>
                    </Step>
                    <Step>
                        <StepLabel>Wait for capture data to stop</StepLabel>
                        <StepContent>
                            <LinearProgress />
                            Logs
                        </StepContent>
                    </Step>
                    <Step>
                        <StepLabel>Mark materialization notBefore</StepLabel>
                        <StepContent>describe what we're doing</StepContent>
                    </Step>
                    <Step>
                        <StepLabel>Enable capture</StepLabel>
                        <StepContent>Logs</StepContent>
                    </Step>
                    <Step>
                        <StepLabel>
                            Publish capture and materialization
                        </StepLabel>
                        <StepContent>Logs</StepContent>
                    </Step>
                </Stepper>
            </DialogContent>
            <DialogActions>
                <Stack direction="row" spacing={2}>
                    <Button onClick={handleBack} variant="text">
                        Back
                    </Button>

                    <Button onClick={handleNext} variant="outlined">
                        Continue
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
}

export default DataflowReset;

import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
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
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    return (
        <Dialog
            maxWidth="lg"
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
                Foo
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
                            <Box>
                                <Button onClick={closeDialog}>Cancel</Button>

                                <Button onClick={handleNext}>Continue</Button>
                            </Box>
                        </StepContent>
                    </Step>
                    <Step>
                        <StepLabel>Select Materialization</StepLabel>
                        <StepContent>
                            <BindingReview />
                            <Box>
                                <Button onClick={handleBack}>Back</Button>

                                <Button onClick={handleNext}>Continue</Button>
                            </Box>
                        </StepContent>
                    </Step>
                    <Step>
                        <StepLabel>Disable Capture</StepLabel>
                        <StepContent>Logs</StepContent>
                    </Step>
                    <Step>
                        <StepLabel>Mark Materialization notBefore</StepLabel>
                        <StepContent>describe what we're doing</StepContent>
                    </Step>
                    <Step>
                        <StepLabel>Enable Capture</StepLabel>
                        <StepContent>Logs</StepContent>
                    </Step>
                    <Step>
                        <StepLabel>
                            Publish Capture and Materialization
                        </StepLabel>
                        <StepContent>Logs</StepContent>
                    </Step>
                </Stepper>
            </DialogContent>
        </Dialog>
    );
}

export default DataflowReset;

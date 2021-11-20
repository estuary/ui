import { createAjv } from '@jsonforms/core';
import {
    materialCells,
    materialRenderers,
} from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import CloseIcon from '@mui/icons-material/Close';
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Stack,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    TextField,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/system';
import axios from 'axios';
import PaitentLoad from 'components/shared/PaitentLoad';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import ReactJson from 'react-json-view';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SourceTypeSelect from './SourceTypeSelect';

NewCaptureModal.propTypes = {};
function NewCaptureModal(
    props: PropTypes.InferProps<typeof NewCaptureModal.propTypes>
) {
    const handleDefaultsAjv = createAjv({ useDefaults: true });

    const initialSchemaState = {
        error: null,
        fetching: false,
        schema: null,
        image: null,
    };

    const formOptions = {
        restrict: true,
        showUnfocusedDescription: true,
    };

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const sourceTypeParam = searchParams.get('sourcetype');

    useEffect(() => {
        if (sourceTypeParam !== null) {
            fetchSchemaForForm(sourceTypeParam);
        }
    }, [sourceTypeParam]);

    const [sourceType] = useState(sourceTypeParam ? sourceTypeParam : '');
    const [sourceName, setSourceName] = useState('');
    const [currentSchema, setCurrentSchema] = useState(initialSchemaState);
    const [newCaptureFormData, setNewCaptureFormData] = useState({});
    const [newCaptureFormErrors, setNewCaptureFormErrors] = useState([]);
    const [saveEnabled, setSaveEnabled] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formSubmitError, setFormSubmitError] = useState(null);
    const [catalogResponse, setCatalogResponse] = useState({});

    const [activeStep, setActiveStep] = useState(0);

    const fetchSchemaForForm = (key: any) => {
        setShowValidation(false);
        setNewCaptureFormData({});
        setNewCaptureFormErrors([]);
        setActiveStep(1);
        axios.get(`http://localhost:3001/source/${key}`).then(
            (response) => {
                setCurrentSchema({
                    ...initialSchemaState,
                    schema: response.data.specification.spec
                        .connectionSpecification,
                    image: response.data.details.image,
                });
                setSaveEnabled(true);
            },
            (error) => {
                setCurrentSchema({
                    ...initialSchemaState,
                    error: error.response
                        ? error.response.data.message
                        : error.message,
                });
                setSaveEnabled(false);
                setActiveStep(0);
            }
        );
    };

    const handleClose = () => {
        setCurrentSchema(initialSchemaState);
        navigate('..'); //This is assuming this is a child of the /captures route.
    };

    const handleTest = (event: any) => {
        event.preventDefault();
        if (newCaptureFormErrors.length > 0) {
            setShowValidation(true);
        } else {
            const formSubmitData = {
                config: newCaptureFormData,
                image: currentSchema.image,
                name: sourceName,
                type: sourceTypeParam,
            };
            setSaveEnabled(false);
            setActiveStep(2);
            setFormSubmitting(true);
            axios
                .post('http://localhost:3001/catalog', formSubmitData)
                .then((response) => {
                    console.log('Catalog Created', response.data);
                    setFormSubmitting(false);
                    setFormSubmitError(null);
                    setCatalogResponse(response.data);
                    setSaveEnabled(true);
                    setActiveStep(3);
                })
                .catch((error) => {
                    if (error.response) {
                        setFormSubmitError(error.response.data.message);
                    } else {
                        setFormSubmitError(error.message);
                    }
                    setFormSubmitting(false);
                    setSaveEnabled(true);
                    setActiveStep(1);
                });
        }
    };

    const getSourceDetails = async (key: string) => {
        const hasKey = Boolean(key && key.length > 0);
        setCurrentSchema({
            ...initialSchemaState,
            fetching: hasKey,
        });
        setSearchParams(hasKey ? { sourcetype: key } : {});
        setSaveEnabled(hasKey);
    };

    const formChanged = ({ data, errors }: { data: any; errors: any }) => {
        setNewCaptureFormData(data);
        setNewCaptureFormErrors(errors);
    };

    const handleNameChange = (event: any) => {
        setSourceName(event.target.value);
    };

    const handleApply = (event: any) => {
        event.preventDefault();
        if (newCaptureFormErrors.length > 0) {
            setShowValidation(true);
        } else {
            const formSubmitData = {
                config: catalogResponse,
                type: sourceTypeParam,
            };
            setSaveEnabled(false);
            setFormSubmitting(true);
            axios
                .post('http://localhost:3001/catalog/apply', formSubmitData)
                .then((response) => {
                    console.log('Catalog Applied', response.data);
                    setFormSubmitting(false);
                    setFormSubmitError(null);
                    setCatalogResponse({});
                    handleClose();
                })
                .catch((error) => {
                    if (error.response) {
                        setFormSubmitError(error.response.data.message);
                    } else {
                        setFormSubmitError(error.message);
                    }
                    setFormSubmitting(false);
                    setSaveEnabled(true);
                    setActiveStep(1);
                });
        }
    };

    const jsonFormRendered = (() => {
        if (currentSchema.error !== null) {
            return (
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {currentSchema.error}
                </Alert>
            );
        } else {
            if (currentSchema.schema !== null) {
                return (
                    <form id="newCaptureForm">
                        <JsonForms
                            schema={currentSchema.schema}
                            data={newCaptureFormData}
                            renderers={materialRenderers}
                            cells={materialCells}
                            config={formOptions}
                            readonly={formSubmitting}
                            ajv={handleDefaultsAjv}
                            validationMode={
                                showValidation
                                    ? 'ValidateAndShow'
                                    : 'ValidateAndHide'
                            }
                            onChange={formChanged}
                        />
                    </form>
                );
            } else {
                return null;
            }
        }
    })();

    return (
        <>
            <Dialog
                open
                onClose={handleClose}
                scroll="paper"
                fullScreen={fullScreen}
                fullWidth={!fullScreen}
                maxWidth={'md'}
                sx={{
                    '.MuiDialog-container': {
                        alignItems: 'flex-start',
                    },
                }}
                aria-labelledby="new-capture-dialog-title"
            >
                <DialogTitle id="new-capture-dialog-title">
                    New Capture
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            color: (theme) => theme.palette.grey[500],
                            position: 'absolute',
                            right: 0,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Stepper activeStep={activeStep} orientation="vertical">
                        <Step key={0}>
                            <StepLabel>Name &amp; Source Type</StepLabel>
                            <StepContent
                                TransitionProps={{ unmountOnExit: false }}
                            >
                                <DialogContentText>
                                    To get started please provide a unique name
                                    and the source type of the Capture you want
                                    to create. Once you've filled out the source
                                    details you can click "Test Capture" down
                                    below to test the connection.
                                </DialogContentText>
                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        id="capture-name"
                                        label="Name of capture"
                                        variant="outlined"
                                        value={sourceName}
                                        onChange={handleNameChange}
                                    />
                                    <SourceTypeSelect
                                        id="source-type-select"
                                        sourceType={sourceType}
                                        onSourceChange={getSourceDetails}
                                    />
                                </Stack>
                            </StepContent>
                        </Step>
                        <Step key={1}>
                            <StepLabel>Configuration</StepLabel>
                            <StepContent
                                TransitionProps={{ unmountOnExit: false }}
                            >
                                <Box sx={{ width: '100%' }}>
                                    {formSubmitError ? (
                                        <Alert severity="error">
                                            <AlertTitle>
                                                Capture test failed
                                            </AlertTitle>
                                            <Typography variant="subtitle1">
                                                {formSubmitError}
                                            </Typography>
                                        </Alert>
                                    ) : null}

                                    {currentSchema.fetching ? (
                                        <PaitentLoad
                                            on={currentSchema.fetching}
                                        />
                                    ) : (
                                        jsonFormRendered
                                    )}
                                </Box>
                            </StepContent>
                        </Step>
                        <Step key={2}>
                            <StepLabel>Test</StepLabel>
                            <StepContent>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <CircularProgress />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            ml: 2,
                                        }}
                                    >
                                        Testing configuration...
                                    </Typography>
                                </Box>
                            </StepContent>
                        </Step>
                        <Step key={3}>
                            <StepLabel>Finalize</StepLabel>
                            <StepContent>
                                <ReactJson
                                    src={catalogResponse}
                                    collapsed={2}
                                    enableClipboard={false}
                                />
                            </StepContent>
                        </Step>
                    </Stepper>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} size="large" color="error">
                        Cancel
                    </Button>
                    {activeStep > 2 ? (
                        <Button
                            onClick={handleApply}
                            disabled={!saveEnabled}
                            size="large"
                            color="success"
                            variant="contained"
                            disableElevation
                        >
                            Apply to Flow
                        </Button>
                    ) : (
                        <Button
                            onClick={handleTest}
                            disabled={!saveEnabled || currentSchema.fetching}
                            form="newCaptureForm"
                            size="large"
                            type="submit"
                            color="success"
                            variant="contained"
                            disableElevation
                        >
                            Test Capture
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
}

export default NewCaptureModal;

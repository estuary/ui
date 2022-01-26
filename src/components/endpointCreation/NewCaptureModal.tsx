import { createAjv } from '@jsonforms/core';
import {
    materialCells,
    materialRenderers
} from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import Editor from '@monaco-editor/react';
import CloseIcon from '@mui/icons-material/Close';
import {
    Alert,
    AlertTitle,
    AppBar,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItem,
    Paper,
    Skeleton,
    Stack,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import axios from 'axios';
import ErrorBoundary from 'components/shared/ErrorBoundry';
import ExternalLink from 'components/shared/ExternalLink';
import FormLoading from 'components/shared/FormLoading';
import CaptureSourceControl from 'forms/renderers/CaptureSource/CaptureSourceControl';
import captureSourceTester from 'forms/renderers/CaptureSource/captureSourceTester';
import useCaptureSchema from 'hooks/useCaptureSchema';
import useSourceSchema from 'hooks/useSourceSchema';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useSearchParams } from 'react-router-dom';

NewCaptureModal.propTypes = {};
function NewCaptureModal(
    props: PropTypes.InferProps<typeof NewCaptureModal.propTypes>
) {
    const handleDefaultsAjv = createAjv({ useDefaults: true });
    const renderers = [
        ...materialRenderers,
        //register custom renderers
        { tester: captureSourceTester, renderer: CaptureSourceControl },
    ];

    const formOptions = {
        restrict: true,
        showUnfocusedDescription: true,
    };

    const intl = useIntl();

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );
    function handleEditorDidMount(
        editor: monacoEditor.editor.IStandaloneCodeEditor
    ) {
        editorRef.current = editor;
        const handler = editor.onDidChangeModelDecorations(() => {
            handler.dispose();
            editor.getAction('editor.action.formatDocument').run();
        });
    }

    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();
    const sourceTypeParam = searchParams.get('sourcetype');
    const { isFetching, schema, error, image } = useSourceSchema(
        sourceTypeParam ? sourceTypeParam : ''
    );

    const [newCaptureDetailsFormData, setNewCaptureDetailsFormData] = useState<{
        tenantName: string;
        captureName: string;
        sourceType: string;
        sourceImage: string;
    }>({
        tenantName: '',
        captureName: '',
        sourceType: sourceTypeParam ? sourceTypeParam : '',
        sourceImage: image ? image : '',
    });
    const [newCaptureDetailsFormErrors, setNewCaptureDetailsFormErrors] =
        useState([]);

    const [newCaptureFormData, setNewCaptureFormData] = useState({});
    const [newCaptureFormErrors, setNewCaptureFormErrors] = useState([]);

    const [showValidation, setShowValidation] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formSubmitError, setFormSubmitError] = useState<{
        message: string;
        errors: any[];
    } | null>(null);
    const [catalogResponse, setCatalogResponse] = useState({} as any);

    const [activeStep, setActiveStep] = useState(0);

    const handleClose = () => {
        navigate('..'); //This is assuming this is a child of the /captures route.
    };

    const handleTest = (event: any) => {
        event.preventDefault();
        if (
            newCaptureDetailsFormData === null ||
            newCaptureDetailsFormErrors.length > 0 ||
            newCaptureFormErrors.length > 0
        ) {
            setShowValidation(true);
        } else {
            const formSubmitData = {
                config: newCaptureFormData,
                captureName: newCaptureDetailsFormData.captureName,
                tenantName: newCaptureDetailsFormData.tenantName,
                sourceImage: newCaptureDetailsFormData.sourceType,
            };
            setFormSubmitError(null);
            setActiveStep(1);
            setFormSubmitting(true);
            axios
                .post('http://localhost:3001/capture/test', formSubmitData)
                .then((response) => {
                    setFormSubmitting(false);
                    setCatalogResponse(response.data);
                    setActiveStep(2);
                })
                .catch((error) => {
                    errorResponseHandler(error);
                });
        }
    };

    const getSourceDetails = async (key: string) => {
        const hasKey = Boolean(key && key.length > 0);
        setSearchParams(hasKey ? { sourcetype: key } : {});
    };

    const formChanged = ({ data, errors }: { data: any; errors: any }) => {
        setNewCaptureFormData(data);
        setNewCaptureFormErrors(errors);
    };

    const typeNameChanged = ({ data, errors }: { data: any; errors: any }) => {
        setNewCaptureDetailsFormData(data);
        setNewCaptureDetailsFormErrors(errors);

        if (data.sourceType) {
            if (data.sourceType !== 'custom') {
                getSourceDetails(data.sourceType);
            }
        }
    };

    const handleDelete = () => {
        alert('Delete? You sure?');
    };

    const errorResponseHandler = (error: any, step: number = 0) => {
        if (error.response) {
            setFormSubmitError(error.response.data);
        } else {
            setFormSubmitError(error.message);
        }
        setFormSubmitting(false);
        setActiveStep(step);
    };

    const handleSave = (event: any) => {
        event.preventDefault();
        let catalogVal = '';

        if (editorRef && editorRef.current) {
            catalogVal = editorRef.current.getValue();
        }

        setFormSubmitting(true);

        // Create blob link to download
        const url = window.URL.createObjectURL(
            new Blob([catalogVal], {
                type: 'text/plain',
            })
        );

        // Make download link
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
            'download',
            `${newCaptureDetailsFormData.tenantName}.${newCaptureDetailsFormData.captureName}.flow.yaml`
        );

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        window.setTimeout(() => {
            // Clean up and remove the link
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            handleClose();
        }, 0);
    };

    const captureSchema = useCaptureSchema();
    const captureUISchema = {
        type: 'VerticalLayout',
        elements: [
            {
                type: 'HorizontalLayout',
                elements: [
                    {
                        type: 'Control',
                        label: intl.formatMessage({ id: "captureCreation.form.tenant.label" })
                        ,
                        scope: '#/properties/tenantName',
                    },
                    {
                        type: 'Control',
                        label: intl.formatMessage({ id: "captureCreation.form.name.label" }),
                        scope: '#/properties/captureName',
                    },
                    {
                        type: 'Control',
                        label: intl.formatMessage({ id: "captureCreation.form.source.label" }),
                        scope: '#/properties/sourceType',
                    },
                ],
            },
            {
                type: 'Control',
                label: 'Image',
                scope: '#/properties/sourceImage',
                rule: {
                    effect: 'SHOW',
                    condition: {
                        scope: '#/properties/sourceType',
                        schema: { const: 'custom' },
                    },
                },
            },
        ],
    };

    const jsonFormRendered = (() => {
        if (error !== null) {
            return (
                <Alert severity="error">
                    <AlertTitle><FormattedMessage id='common.errors.heading' /></AlertTitle>
                    {error}
                </Alert>
            );
        } else if (schema && schema.connectionSpecification !== null) {
            return (
                <ErrorBoundary>
                    <AppBar position="relative" elevation={0} color="default">
                        <Toolbar
                            variant="dense"
                            sx={{
                                justifyContent: 'space-between',
                            }}
                        >
                            <Typography variant="h5" color="initial">
                                {image}
                            </Typography>
                            {schema.documentationUrl ? (
                                <ExternalLink link={schema.documentationUrl}>
                                    <FormattedMessage id='captureCreation.config.source.doclink' />
                                </ExternalLink>
                            ) : null}
                        </Toolbar>
                    </AppBar>
                    <Divider />
                    <StyledEngineProvider injectFirst>
                        <JsonForms
                            schema={schema.connectionSpecification}
                            data={newCaptureFormData}
                            renderers={renderers}
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
                    </StyledEngineProvider>
                </ErrorBoundary>
            );
        } else {
            return null;
        }
    })();

    const errorList = (() => {
        if (
            formSubmitError &&
            formSubmitError.errors &&
            formSubmitError.errors.length > 0
        ) {
            return (
                <List dense>
                    {formSubmitError.errors.map(
                        (error: string, index: number) => {
                            return (
                                <ListItem key={index + error}>{error}</ListItem>
                            );
                        }
                    )}
                </List>
            );
        } else {
            return null;
        }
    })();

    const errorRendered = (() => {
        let response;

        if (formSubmitError) {
            response = (
                <Box sx={{ width: '100%' }}>
                    <Alert severity="error">
                        <AlertTitle>
                            <FormattedMessage id='captureCreation.testing.config.failed' />
                        </AlertTitle>
                        <Typography variant="subtitle1">
                            {formSubmitError.message}
                        </Typography>
                        {errorList}
                    </Alert>
                </Box>
            );
        }

        return response;
    })();

    return (
        <>
            <Dialog
                open
                onClose={handleClose}
                scroll="paper"
                fullScreen={fullScreen}
                fullWidth={!fullScreen}
                maxWidth={'lg'}
                sx={{
                    '.MuiDialog-container': {
                        alignItems: 'flex-start',
                    },
                }}
                aria-labelledby="new-capture-dialog-title"
            >
                <DialogTitle id="new-capture-dialog-title">
                    <FormattedMessage id='captureCreation.heading' />
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

                {errorRendered}

                <DialogContent dividers>
                    <Stepper activeStep={activeStep} orientation="vertical">
                        <Step key={0}>
                            <StepLabel>Config</StepLabel>
                            <StepContent
                                TransitionProps={{ unmountOnExit: false }}
                            >
                                <DialogContentText>
                                    <FormattedMessage id='captureCreation.instructions' />
                                </DialogContentText>

                                <form id="newCaptureForm">
                                    <Stack direction="row" spacing={2}>
                                        {captureSchema.schema !== null ? (
                                            <JsonForms
                                                schema={captureSchema.schema}
                                                uischema={captureUISchema}
                                                data={newCaptureDetailsFormData}
                                                renderers={renderers}
                                                cells={materialCells}
                                                config={formOptions}
                                                readonly={formSubmitting}
                                                ajv={handleDefaultsAjv}
                                                validationMode={
                                                    showValidation
                                                        ? 'ValidateAndShow'
                                                        : 'ValidateAndHide'
                                                }
                                                onChange={typeNameChanged}
                                            />
                                        ) : (
                                            <>
                                                <Skeleton
                                                    variant="rectangular"
                                                    height={40}
                                                    width={'33%'}
                                                />
                                                <Skeleton
                                                    variant="rectangular"
                                                    height={40}
                                                    width={'33%'}
                                                />
                                                <Skeleton
                                                    variant="rectangular"
                                                    height={40}
                                                    width={'33%'}
                                                />
                                            </>
                                        )}
                                    </Stack>

                                    <Paper
                                        sx={{ width: '100%' }}
                                        variant="outlined"
                                    >
                                        {isFetching ? (
                                            <FormLoading />
                                        ) : (
                                            jsonFormRendered
                                        )}
                                    </Paper>
                                </form>
                            </StepContent>
                        </Step>
                        <Step key={1}>
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
                                        <FormattedMessage id='captureCreation.testing.config.loading' />
                                    </Typography>
                                </Box>
                            </StepContent>
                        </Step>
                        <Step key={2}>
                            <StepLabel>Review</StepLabel>
                            <StepContent>
                                <DialogContentText>
                                    <FormattedMessage id='captureCreation.final.review.instructions' />
                                </DialogContentText>
                                <Paper variant="outlined">
                                    {catalogResponse &&
                                        catalogResponse.data &&
                                        catalogResponse.data.data ? (
                                        <Editor
                                            height="350px"
                                            defaultLanguage="json"
                                            theme={
                                                theme.palette.mode === 'light'
                                                    ? 'vs'
                                                    : 'vs-dark'
                                            }
                                            defaultValue={JSON.stringify(
                                                catalogResponse.data.data
                                            )}
                                            path={catalogResponse.path}
                                            onMount={handleEditorDidMount}
                                        />
                                    ) : (
                                        <FormattedMessage id='common.loading' />
                                    )}
                                </Paper>
                            </StepContent>
                        </Step>
                    </Stepper>
                </DialogContent>

                <DialogActions>
                    {activeStep > 1 ? (
                        <>
                            <Button
                                onClick={handleDelete}
                                size="large"
                                color="error"
                            >
                                <FormattedMessage id='cta.delete' />
                            </Button>
                            <Button
                                onClick={handleSave}
                                size="large"
                                color="success"
                                variant="contained"
                                disableElevation
                            >
                                <FormattedMessage id='cta.download' />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={handleClose}
                                size="large"
                                color="error"
                            >
                                <FormattedMessage id='cta.cancel' />
                            </Button>
                            <Button
                                onClick={handleTest}
                                disabled={isFetching}
                                form="newCaptureForm"
                                size="large"
                                type="submit"
                                color="success"
                                variant="contained"
                                disableElevation
                            >
                                <FormattedMessage id='captureCreation.ctas.test.config' />
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
}

export default NewCaptureModal;

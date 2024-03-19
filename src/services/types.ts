export enum CustomEvents {
    CAPTURE_CREATE = 'Capture_Create',
    CAPTURE_CREATE_CONFIG_CREATE = 'Capture_Create_Config_Create',
    CAPTURE_CREATE_CONFIG_EDIT = 'Capture_Create_Config_Edit',
    CAPTURE_DISCOVER = 'Capture_Discover',
    CAPTURE_EDIT = 'Capture_Edit',
    CAPTURE_MATERIALIZE_ATTEMPT = 'Capture_Materialize_Attempt',
    CAPTURE_MATERIALIZE_FAILED = 'Capture_Materialize_Failed',
    CAPTURE_MATERIALIZE_SUCCESS = 'Capture_Materialize_Success',
    CAPTURE_TEST = 'Capture_Test',
    COLLECTION_CREATE = 'Collection_Create',
    CONNECTOR_VERSION_UNSUPPORTED = 'Connector_Version:Unsupported',
    DIRECTIVE = 'Directive',
    DIRECTIVE_EXCHANGE_TOKEN = 'Directive:ExchangeToken',
    ERROR_BOUNDARY_DISPLAYED = 'Error_Boundary_Displayed',
    ERROR_BOUNDARY_PAYMENT_METHODS = 'Error_Boundary_Displayed:PaymentMethods',
    ERROR_DISPLAYED = 'Error_Displayed',
    ERROR_MISSING_MESSAGE = 'Error_Missing_Message',
    FIELD_SELECTION_REFRESH_AUTO = 'Field_Selection_Refresh:Auto',
    FIELD_SELECTION_REFRESH_MANUAL = 'Field_Selection_Refresh:Manual',
    FULL_PAGE_ERROR_DISPLAYED = 'Full_Page_Error_Displayed',
    GATEWAY_TOKEN_FAILED = 'Gateway_Auth_Token:CallFailed',
    GATEWAY_TOKEN_INVALID_PREFIX = 'Gateway_Auth_Token:InvalidPrefix',
    LAZY_LOADING = 'Lazy Loading',
    LOGIN = 'Login',
    LOGS_DOCUMENT_COUNT = 'Logs:Document:Count',
    JOURNAL_DATA_STATUS = 'JournalData:Status',
    JOURNAL_DATA_MAX_BYTES_NOT_ENOUGH = 'JournalData:MaxBytesNotEnough',
    JSON_FORMS_NULLABLE_UNSUPPORTED = 'JsonForms:Nullable:Unsupported',
    JSON_FORMS_TYPE_MISSING = 'JsonForms:Type:Missing',
    JSON_SCHEMA_DEREF = 'JsonSchema:Deref',
    MARKETPLACE_VERIFY = 'Marketplace:Verify',
    MATERIALIZATION_CREATE = 'Materialization_Create',
    MATERIALIZATION_CREATE_CONFIG_CREATE = 'Materialization_Create_Config_Create',
    MATERIALIZATION_CREATE_CONFIG_EDIT = 'Materialization_Create_Config_Edit',
    MATERIALIZATION_EDIT = 'Materialization_Edit',
    MATERIALIZATION_TEST = 'Materialization_Test',
    MATERIALIZATION_TEST_BACKGROUND = 'Materialization_Test_Background',
    NOTIFICATION_NETWORK_WARNING = 'Notification_Network_Warning',
    OAUTH_WINDOW_OPENER = 'Oauth_Window_Opener',
    STRIPE_FORM_LOADING_FAILED = 'Stripe_Form_Loading_Failed',
    SUPABASE_CALL_FAILED = 'Supabase_Call_Failed',
    SUPABASE_CALL_UNAUTHENTICATED = 'Supabase_Call_Unauthenticated',
    SWR_LOADING_SLOW = 'SWR_Loading_Slow',
}

export type CommonStatuses = 'success' | 'failed' | 'exception' | 'skipped';

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
    DIRECTIVE = 'Directive',
    DIRECTIVE_EXCHANGE_TOKEN = 'Directive:ExchangeToken',
    ERROR_BOUNDARY_DISPLAYED = 'Error_Boundary_Displayed',
    ERROR_BOUNDARY_PAYMENT_METHODS = 'Error_Boundary_Displayed:PaymentMethods',
    FIELD_SELECTION_REFRESH_AUTO = 'Field_Selection_Refresh:Auto',
    FIELD_SELECTION_REFRESH_MANUAL = 'Field_Selection_Refresh:Manual',
    FULL_PAGE_ERROR_DISPLAYED = 'Full_Page_Error_Displayed',
    GATEWAY_TOKEN_FAILED = 'Gateway_Auth_Token:CallFailed',
    GATEWAY_TOKEN_INVALID_PREFIX = 'Gateway_Auth_Token:InvalidPrefix',
    MATERIALIZATION_CREATE = 'Materialization_Create',
    MATERIALIZATION_CREATE_CONFIG_CREATE = 'Materialization_Create_Config_Create',
    MATERIALIZATION_CREATE_CONFIG_EDIT = 'Materialization_Create_Config_Edit',
    MATERIALIZATION_EDIT = 'Materialization_Edit',
    MATERIALIZATION_TEST = 'Materialization_Test',
    MATERIALIZATION_TEST_BACKGROUND = 'Materialization_Test_Background',
    NOTIFICATION_NETWORK_WARNING = 'Notification_Network_Warning',
    STRIPE_FORM_LOADING_FAILED = 'Stripe_Form_Loading_Failed',
    SUPABASE_CALL_FAILED = 'Supabase_Call_Failed',
    SUPABASE_CALL_UNAUTHENTICATED = 'Supabase_Call_Unauthenticated',
    SWR_LOADING_SLOW = 'SWR_Loading_Slow',
}

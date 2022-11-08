import ValidationErrorSummary from 'components/shared/Entity/ValidationErrorSummary';
import {
    useResourceConfig_hydrationErrorsExist,
    useResourceConfig_resourceConfigErrorsExist,
} from 'stores/ResourceConfig/hooks';

interface Props {
    errorsExist: boolean;
    ErrorComponent?: any | boolean;
    hideIcon?: boolean;
    headerMessageId?: string;
}

function ExtendedValidationErrorSummary({
    headerMessageId,
    hideIcon,
    ErrorComponent,
    errorsExist,
}: Props) {
    // Resource Config Store
    const resourceConfigHydrationErrorsExist =
        useResourceConfig_hydrationErrorsExist();

    const resourceConfigErrorsExist =
        useResourceConfig_resourceConfigErrorsExist();

    return (
        <ValidationErrorSummary
            errorsExist={errorsExist}
            ErrorComponent={ErrorComponent}
            hideIcon={hideIcon}
            headerMessageId={headerMessageId}
            resourceConfigErrorsExist={{
                hydration: resourceConfigHydrationErrorsExist,
                form: resourceConfigErrorsExist,
            }}
        />
    );
}

export default ExtendedValidationErrorSummary;

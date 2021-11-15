import { Alert, AlertTitle } from '@mui/material';
import PropTypes from 'prop-types';

ErrorSummary.propTypes = {
    errors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

// TODO : Delete this or make is useful. Right now JSON Forms is kinda hard to write custom validation
// just so that we don't have to display validation errors right away.
function ErrorSummary(
    props: PropTypes.InferProps<typeof ErrorSummary.propTypes>
) {
    const { errors } = props;

    if (errors && errors.length > 0) {
        return (
            <Alert severity="error">
                <AlertTitle>Form failed validation</AlertTitle>
                {errors.map((error: any) => {
                    return error;
                })}
            </Alert>
        );
    } else {
        return null;
    }
}

export default ErrorSummary;

import AlertBox from 'components/shared/AlertBox';
import Message from 'components/shared/Error/Message';
import { BASE_ERROR } from 'services/supabase';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';

export default function ServerError() {
    const serverError = useEntityStatusStore((state) => state.serverError);

    if (!serverError) {
        return null;
    }

    return (
        <AlertBox
            severity="error"
            short
            title={serverError.error ? serverError.message : undefined}
        >
            <Message
                error={{
                    ...BASE_ERROR,
                    message: serverError.error ?? serverError.message,
                }}
            />
        </AlertBox>
    );
}

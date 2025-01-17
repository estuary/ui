import { authenticatedRoutes } from 'app/routes';
import MessageWithButton from 'components/content/MessageWithButton';
import { useNavigate } from 'react-router';

export default function NoCollectionJournalsAlert() {
    const navigate = useNavigate();

    return (
        <MessageWithButton
            messageId="collectionsPreview.notFound.message"
            clickHandler={() => {
                navigate(authenticatedRoutes.captures.fullPath);
            }}
        />
    );
}

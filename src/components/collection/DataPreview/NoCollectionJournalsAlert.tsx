import { authenticatedRoutes } from 'src/app/routes';
import MessageWithButton from 'src/components/content/MessageWithButton';
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

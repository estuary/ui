import { useNavigate } from 'react-router';

import { authenticatedRoutes } from 'src/app/routes';
import MessageWithButton from 'src/components/content/MessageWithButton';

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

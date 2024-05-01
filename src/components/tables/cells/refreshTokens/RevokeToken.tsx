import { Button, TableCell } from '@mui/material';
import { updateRefreshTokenValidity } from 'api/tokens';
import { FormattedMessage } from 'react-intl';

const TOKEN_VALIDITY = '0 days';

interface Props {
    id: string;
}

function RevokeTokenButton({ id }: Props) {
    const revokeToken = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        const response = await updateRefreshTokenValidity(id, TOKEN_VALIDITY);

        console.log('revoked token', response);

        if (response.error || !response.data) {
            console.log('error');
        }
    };

    return (
        <TableCell>
            <Button variant="text" onClick={revokeToken}>
                <FormattedMessage id="cta.revoke" />
            </Button>
        </TableCell>
    );
}

export default RevokeTokenButton;

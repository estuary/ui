import DeleteConfirmation from 'components/tables/RowActions/Delete/Confirmation';
import DeleteProgress from 'components/tables/RowActions/Delete/Progress';
import RowActionButton from 'components/tables/RowActions/Shared/Button';

function DeleteButton() {
    return (
        <RowActionButton
            confirmationMessage={<DeleteConfirmation />}
            renderProgress={(item, index, onFinish) => (
                <DeleteProgress
                    key={`Item-delete-${index}`}
                    entity={item}
                    onFinish={onFinish}
                />
            )}
            messageID="cta.delete"
        />
    );
}

export default DeleteButton;

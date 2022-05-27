import DeleteConfirmation from 'components/tables/RowActions/Delete/Confirmation';
import RowActionButton from 'components/tables/RowActions/Shared/Button';
import UpdateEntity from 'components/tables/RowActions/Shared/UpdateEntity';

function DeleteButton() {
    const generator = () => null;

    return (
        <RowActionButton
            confirmationMessage={<DeleteConfirmation />}
            renderProgress={(item, index, onFinish) => (
                <UpdateEntity
                    key={`Item-delete-${index}`}
                    entity={item}
                    onFinish={onFinish}
                    successMessageID="common.deleted"
                    runningMessageID="common.deleting"
                    generateNewSpec={generator}
                    generateNewSpecType={generator}
                />
            )}
            messageID="cta.delete"
        />
    );
}

export default DeleteButton;

import type { DisableEnableButtonProps } from 'src/components/tables/RowActions/DisableEnable/types';

import DisableEnableConfirmation from 'src/components/tables/RowActions/DisableEnable/Confirmation';
import RowActionConfirmation from 'src/components/tables/RowActions/Shared/Confirmation';
import GroupedRowActionButton from 'src/components/tables/RowActions/Shared/GroupedButton';
import UpdateEntities from 'src/components/tables/RowActions/Shared/UpdateEntities';
import { SelectTableStoreNames } from 'src/stores/names';
import { generateDisabledSpec } from 'src/utils/entity-utils';

function DisableEnableButton({
    enabling,
    selectableTableStoreName,
}: DisableEnableButtonProps) {
    const messages = {
        running: enabling ? 'common.enabling' : 'common.disabling',
        skipped: 'updateEntity.collection.skipped',
        success: enabling ? 'common.enabled' : 'common.disabled',
    };

    // Collections do not have shards in the root they are nested inside
    //  the settings for the derivation
    const shardsAreNested =
        selectableTableStoreName === SelectTableStoreNames.COLLECTION;

    return (
        <GroupedRowActionButton
            renderConfirmationMessage={(selectedNames) => {
                return (
                    <RowActionConfirmation
                        selected={selectedNames}
                        message={
                            <DisableEnableConfirmation
                                enabling={enabling}
                                selectableTableStoreName={
                                    selectableTableStoreName
                                }
                            />
                        }
                        selectableTableStoreName={selectableTableStoreName}
                    />
                );
            }}
            renderProgress={(items, onFinish) => (
                <UpdateEntities
                    entities={items}
                    onFinish={onFinish}
                    validateNewSpec
                    skippedMessageID={messages.skipped}
                    successMessageID={messages.success}
                    runningMessageID={messages.running}
                    generateNewSpec={(spec) =>
                        generateDisabledSpec(spec, enabling, shardsAreNested)
                    }
                    generateNewSpecType={(entity) => entity.spec_type}
                    selectableStoreName={selectableTableStoreName}
                />
            )}
            messageID={enabling ? 'cta.enable' : 'cta.disable'}
            selectableTableStoreName={selectableTableStoreName}
        />
    );
}

export default DisableEnableButton;

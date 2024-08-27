import { CommonMessages } from './CommonMessages';

export const PrefixedName: Record<string, string> = {
    'prefixedName.description': `Select a prefix from the drop-down and add a unique name. (ex: ${CommonMessages['common.exampleName']})`,
    'prefixedName.description.noPrefix': `Please select a prefix from the drop-down.`,
    'prefixedName.description.singlePrefix': `Give your {entityType} a unique name. (ex: ${CommonMessages['common.exampleName']})`,
    'prefixedName.description.singlePrefix.noEntityType': `Please add a unique name. (ex: ${CommonMessages['common.exampleName']})`,
};

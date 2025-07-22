import type { BaseMaterializationFields } from 'src/types/schemaModels';

export const DEFAULT_RECOMMENDED_FLAG: BaseMaterializationFields['recommended'] = 1;

export const canRecommendFields = (
    recommendedFlag: BaseMaterializationFields['recommended'] | undefined
): boolean => recommendedFlag !== false;

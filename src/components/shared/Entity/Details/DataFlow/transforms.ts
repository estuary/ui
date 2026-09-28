import type {
    TransformInfo,
    TransformShuffle,
} from 'src/components/shared/Entity/Details/DataFlow/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const asString = (value: unknown): string | null =>
    typeof value === 'string' && value.length > 0 ? value : null;

const parseShuffle = (shuffle: unknown): TransformShuffle => {
    if (shuffle === 'any') {
        return { type: 'any' };
    }

    if (isRecord(shuffle)) {
        if (Array.isArray(shuffle.key)) {
            return {
                type: 'key',
                key: shuffle.key.filter(
                    (ptr): ptr is string => typeof ptr === 'string'
                ),
            };
        }

        if ('lambda' in shuffle) {
            return { type: 'lambda' };
        }
    }

    // Absent: shuffles on the source collection's key.
    return { type: 'default' };
};

const parseTransform = (transform: unknown): TransformInfo | null => {
    if (!isRecord(transform)) {
        return null;
    }

    const name = asString(transform.name);
    const { source } = transform;

    let sourceName: string | null = null;
    let hasPartitionSelector = false;
    let notBefore: string | null = null;
    let notAfter: string | null = null;

    if (typeof source === 'string') {
        sourceName = asString(source);
    } else if (isRecord(source)) {
        sourceName = asString(source.name);
        hasPartitionSelector = isRecord(source.partitions);
        notBefore = asString(source.notBefore);
        notAfter = asString(source.notAfter);
    }

    if (!name || !sourceName) {
        return null;
    }

    return {
        name,
        source: sourceName,
        shuffle: parseShuffle(transform.shuffle),
        readDelay: asString(transform.readDelay),
        priority:
            typeof transform.priority === 'number' ? transform.priority : null,
        hasPartitionSelector,
        notBefore,
        notAfter,
        disabled: transform.disable === true,
    };
};

// Returns null when the model is not a derivation. Malformed transforms are
// skipped rather than failing the whole view.
export const parseTransforms = (model: unknown): TransformInfo[] | null => {
    if (!isRecord(model) || !isRecord(model.derive)) {
        return null;
    }

    const { transforms } = model.derive;

    if (!Array.isArray(transforms)) {
        return [];
    }

    return transforms
        .map(parseTransform)
        .filter((transform): transform is TransformInfo => transform !== null);
};

export const formatShuffle = (shuffle: TransformShuffle): string => {
    switch (shuffle.type) {
        case 'any':
            return 'any';
        case 'key':
            return `key ${shuffle.key.join(', ')}`;
        case 'lambda':
            return 'lambda';
        default:
            return 'source key';
    }
};

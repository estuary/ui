import {
    formatAlertType,
    getModelFacts,
} from 'src/components/shared/Entity/Details/DataFlow/details';
import { ALICE } from 'src/components/shared/Entity/Details/DataFlow/fixtures';

const modelOf = (name: string) =>
    (
        ALICE.data.liveSpecs.edges.find(
            ({ node }) => (node as { catalogName: string }).catalogName === name
        )?.node as { liveSpec: { model: unknown } }
    ).liveSpec.model;

describe('getModelFacts', () => {
    test('capture: connector image without registry, binding counts', () => {
        expect(getModelFacts('capture', modelOf('acmeCo/shop-ingest'))).toEqual(
            {
                connector: 'source-http-ingest:dev',
                bindings: { enabled: 2, disabled: 0 },
                key: null,
                sourceCapture: null,
            }
        );
    });

    test('materialization: dekaf endpoint', () => {
        expect(
            getModelFacts('materialization', modelOf('acmeCo/warehouse'))
        ).toMatchObject({
            connector: 'Dekaf (generic)',
            bindings: { enabled: 2, disabled: 0 },
        });
    });

    test('collection: key only', () => {
        expect(
            getModelFacts('collection', modelOf('acmeCo/customers'))
        ).toEqual({
            connector: null,
            bindings: null,
            key: ['/id'],
            sourceCapture: null,
        });
    });

    test('derivation: runtime and key', () => {
        expect(
            getModelFacts('derivation', modelOf('acmeCo/customer-totals'))
        ).toMatchObject({ connector: 'SQLite', key: ['/customer_id'] });
    });

    test('counts disabled bindings and reads source capture forms', () => {
        const model = {
            endpoint: { connector: { image: 'materialize-postgres:v4' } },
            bindings: [{}, { disable: true }, { disable: false }],
            sourceCapture: { capture: 'acme/source' },
        };

        expect(getModelFacts('materialization', model)).toEqual({
            connector: 'materialize-postgres:v4',
            bindings: { enabled: 2, disabled: 1 },
            key: null,
            sourceCapture: 'acme/source',
        });
        expect(
            getModelFacts('materialization', {
                ...model,
                sourceCapture: 'acme/other',
            }).sourceCapture
        ).toBe('acme/other');
    });

    test('tolerates malformed models', () => {
        expect(getModelFacts('capture', null)).toEqual({
            connector: null,
            bindings: null,
            key: null,
            sourceCapture: null,
        });
        expect(
            getModelFacts('capture', { endpoint: 'nope', bindings: 'x' })
        ).toMatchObject({ connector: null, bindings: null });
        expect(
            getModelFacts('derivation', { derive: { using: {} } }).connector
        ).toBeNull();
    });
});

describe('formatAlertType', () => {
    test('turns snake_case into a sentence', () => {
        expect(formatAlertType('shard_failed')).toBe('Shard failed');
        expect(formatAlertType('task_auto_disabled_idle')).toBe(
            'Task auto disabled idle'
        );
    });
});

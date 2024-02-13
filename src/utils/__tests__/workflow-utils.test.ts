import { DraftSpecsExtQuery_ByCatalogName } from 'api/draftSpecs';
import { FullSourceDictionary } from 'components/editor/Bindings/Store/types';
import {
    ResourceConfig,
    ResourceConfigDictionary,
} from 'stores/ResourceConfig/types';
import { generateMockConnectorConfig } from 'test/test-utils';
import { EntityWithCreateWorkflow } from 'types';
import { generateTaskSpec, getBindingIndex } from 'utils/workflow-utils';

const defaultResponse = -1;
const foundName = 'acme/found';

describe('getBindingIndex', () => {
    describe('returns -1 when', () => {
        test('bindings are missing', () => {
            expect(getBindingIndex(undefined, '')).toBe(defaultResponse);
            expect(getBindingIndex(null, '')).toBe(defaultResponse);
        });

        test('bindings are empty', () => {
            expect(getBindingIndex([], '')).toBe(defaultResponse);
            expect(getBindingIndex([null], '')).toBe(defaultResponse);
            expect(getBindingIndex([undefined], '')).toBe(defaultResponse);
            expect(getBindingIndex([{}], '')).toBe(defaultResponse);
        });

        test('bindings do not contain collection', () => {
            expect(getBindingIndex(['a', 'b', 'c'], foundName)).toBe(-1);
        });
    });

    describe('returns index when ', () => {
        test('collection name is found', () => {
            // Bindings that are listed as strings
            expect(getBindingIndex([foundName, 'b', 'c'], foundName)).toBe(0);
            expect(getBindingIndex(['a', foundName, 'c'], foundName)).toBe(1);
            expect(getBindingIndex(['a', 'b', foundName], foundName)).toBe(2);
        });

        test('collection name is in a property of `target` or `source`', () => {
            expect(
                getBindingIndex(
                    [{ source: 'a' }, { source: foundName }, { source: 'c' }],
                    foundName
                )
            ).toBe(1);

            expect(
                getBindingIndex(
                    [{ target: 'a' }, { target: foundName }, { target: 'c' }],
                    foundName
                )
            ).toBe(1);
        });

        test('collection name is in a nested property of `name`', () => {
            expect(
                getBindingIndex(
                    [{ name: 'a' }, { name: foundName }, { name: 'c' }],
                    foundName
                )
            ).toBe(1);

            expect(
                getBindingIndex(
                    [
                        { source: { name: 'a' } },
                        { source: { name: foundName } },
                        { source: { name: 'c' } },
                    ],
                    foundName
                )
            ).toBe(1);

            expect(
                getBindingIndex(
                    [
                        { target: { name: 'a' } },
                        { target: { name: foundName } },
                        { target: { name: 'c' } },
                    ],
                    foundName
                )
            ).toBe(1);
        });
    });
});

// entityType: EntityWithCreateWorkflow,
// connectorConfig: ConnectorConfig,
// resourceConfigs: ResourceConfigDictionary | null,
// existingTaskData: DraftSpecsExtQuery_ByCatalogName | null,
// sourceCapture: string | null,
// fullSource: FullSourceDictionary | null

describe('generateTaskSpec', () => {
    let entityType: EntityWithCreateWorkflow,
        resourceConfigs: ResourceConfigDictionary | null,
        existingTaskData: DraftSpecsExtQuery_ByCatalogName | null,
        sourceCapture: string | null,
        fullSource: FullSourceDictionary | null;

    const connectorConfig = generateMockConnectorConfig();

    describe('for captures', () => {
        entityType = 'capture';
        describe('when no resource configs are provided', () => {
            resourceConfigs = {};
            test('will return an empty array', () => {
                const response = generateTaskSpec(
                    entityType,
                    connectorConfig,
                    resourceConfigs,
                    existingTaskData,
                    sourceCapture,
                    fullSource
                );
                expect(response.bindings).toBe([]);
            });
        });

        describe('when resource configs are provided', () => {
            const mockedResource = {
                foo: 1,
                bar: 2,
            };
            const mockedResourceConfig: ResourceConfig = {
                errors: [],
                data: mockedResource,
                disable: false,
                previouslyDisabled: false,
            };
            resourceConfigs = {
                [foundName]: mockedResourceConfig,
            };

            test('will return an array with the names as targets', () => {
                const response = generateTaskSpec(
                    entityType,
                    connectorConfig,
                    resourceConfigs,
                    existingTaskData,
                    sourceCapture,
                    fullSource
                );
                expect(response.bindings).toBe([
                    {
                        resource: mockedResource,
                        target: foundName,
                    },
                ]);
            });
        });
    });
});

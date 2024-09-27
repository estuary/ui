import { getDataPlaneScope, parseDataPlaneName } from 'utils/dataPlane-utils';

describe('getDataPlaneScope', () => {
    test(`returns 'public' when a data plane name starts with 'ops/dp/public/'`, () => {
        expect(getDataPlaneScope('ops/dp/public/local-cluster')).toBe('public');
    });

    test(`returns 'private' when a data plane name does not start with 'ops/dp/public/'`, () => {
        expect(getDataPlaneScope('ops/dp/private/melk/aws-eu-west-1-c2')).toBe(
            'private'
        );

        expect(
            getDataPlaneScope('ops/dp/some_fake_scope/melk/aws-eu-west-1-c2')
        ).toBe('private');
    });
});

describe('parseDataPlaneName', () => {
    describe('returns only the whole data plane name', () => {
        test('when the data plane name prefix does not match the specified scope', () => {
            expect(
                parseDataPlaneName(
                    'ops/dp/private/melk/aws-eu-west-1-c2',
                    'public'
                )
            ).toStrictEqual({
                cluster: '',
                prefix: '',
                provider: '',
                region: '',
                whole: 'ops/dp/private/melk/aws-eu-west-1-c2',
            });

            expect(
                parseDataPlaneName('ops/dp/public/aws-eu-west-1-c2', 'private')
            ).toStrictEqual({
                cluster: '',
                prefix: '',
                provider: '',
                region: '',
                whole: 'ops/dp/public/aws-eu-west-1-c2',
            });
        });

        test('when the data plane name prefix is not formatted properly', () => {
            expect(
                parseDataPlaneName(
                    'ops/dp/some_fake_scope/melk/aws-eu-west-1-c2',
                    'private'
                )
            ).toStrictEqual({
                cluster: '',
                prefix: '',
                provider: '',
                region: '',
                whole: 'ops/dp/some_fake_scope/melk/aws-eu-west-1-c2',
            });

            expect(
                parseDataPlaneName(
                    'ops/dp/some_fake_scope/aws-eu-west-1-c2',
                    'public'
                )
            ).toStrictEqual({
                cluster: '',
                prefix: '',
                provider: '',
                region: '',
                whole: 'ops/dp/some_fake_scope/aws-eu-west-1-c2',
            });
        });
    });

    test('returns a prefix when the truncated data plane name contains a slash', () => {
        expect(
            parseDataPlaneName(
                'ops/dp/private/melk/aws-eu-west-1-c2',
                'private'
            )
        ).toStrictEqual({
            cluster: 'c2',
            prefix: 'melk/',
            provider: 'aws',
            region: 'eu-west-1',
            whole: 'ops/dp/private/melk/aws-eu-west-1-c2',
        });

        expect(
            parseDataPlaneName('ops/dp/private/melk/local-cluster', 'private')
        ).toStrictEqual({
            cluster: '',
            prefix: 'melk/',
            provider: 'local',
            region: 'cluster',
            whole: 'ops/dp/private/melk/local-cluster',
        });
    });

    test('returns a cluster when the truncated data plane name suffix contains at least two hyphens', () => {
        expect(
            parseDataPlaneName(
                'ops/dp/private/melk/aws-eu-west-1-c2',
                'private'
            )
        ).toStrictEqual({
            cluster: 'c2',
            prefix: 'melk/',
            provider: 'aws',
            region: 'eu-west-1',
            whole: 'ops/dp/private/melk/aws-eu-west-1-c2',
        });

        expect(
            parseDataPlaneName('ops/dp/public/aws-eu-west-1-c2', 'public')
        ).toStrictEqual({
            cluster: 'c2',
            prefix: '',
            provider: 'aws',
            region: 'eu-west-1',
            whole: 'ops/dp/public/aws-eu-west-1-c2',
        });

        expect(
            parseDataPlaneName('ops/dp/public/gcp-us-central1-c1', 'public')
        ).toStrictEqual({
            cluster: 'c1',
            prefix: '',
            provider: 'gcp',
            region: 'us-central1',
            whole: 'ops/dp/public/gcp-us-central1-c1',
        });

        expect(
            parseDataPlaneName('ops/dp/public/local-some_region-c1', 'public')
        ).toStrictEqual({
            cluster: 'c1',
            prefix: '',
            provider: 'local',
            region: 'some_region',
            whole: 'ops/dp/public/local-some_region-c1',
        });
    });
});

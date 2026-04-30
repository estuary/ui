import {
    buildConnectorImagePath,
    parseConnectorImagePath,
} from 'src/utils/connector-utils';

describe('buildConnectorImagePath', () => {
    test('concatenates imageName and imageTag', () => {
        expect(
            buildConnectorImagePath(
                'ghcr.io/estuary/source-postgres',
                ':v1.2.3'
            )
        ).toBe('ghcr.io/estuary/source-postgres:v1.2.3');
    });

    test('imageTag is expected to include the leading colon', () => {
        expect(
            buildConnectorImagePath('ghcr.io/estuary/source-s3', ':dev')
        ).toBe('ghcr.io/estuary/source-s3:dev');
    });
});

describe('parseConnectorImagePath', () => {
    test('returns imageName and imageTag for a valid path', () => {
        expect(
            parseConnectorImagePath('ghcr.io/estuary/source-postgres:v1.2.3')
        ).toEqual({
            imageName: 'ghcr.io/estuary/source-postgres',
            imageTag: ':v1.2.3',
        });
    });

    test('imageTag includes the leading colon to match the DB format', () => {
        const result = parseConnectorImagePath(
            'ghcr.io/estuary/materialize-postgres:dev'
        );
        expect(result?.imageTag).toBe(':dev');
    });

    test('returns null for an empty string', () => {
        expect(parseConnectorImagePath('')).toBeNull();
    });

    test('returns null when there is no tag', () => {
        expect(
            parseConnectorImagePath('ghcr.io/estuary/source-postgres')
        ).toBeNull();
    });

    test('returns null for paths outside ghcr.io/estuary/', () => {
        expect(
            parseConnectorImagePath('docker.io/library/postgres:14')
        ).toBeNull();
    });

    // FULL_IMAGE_NAME_RE rejects registry URLs with port numbers since they
    // don't start with ghcr.io/estuary/. If the regex were ever relaxed,
    // lastIndexOf(':') would still split correctly on the tag colon (not the
    // port colon), so the parsing logic itself is safe.
    test('returns null for registry URLs with ports (rejected by FULL_IMAGE_NAME_RE)', () => {
        expect(
            parseConnectorImagePath(
                'ghcr.io:5000/estuary/source-postgres:v1.2.3'
            )
        ).toBeNull();
    });
});

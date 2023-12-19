import { getAuthRoles } from 'api/combinedGrantsExt';
import { expect, test } from 'vitest';

test('getAuthRoles will fetch roles that match the capability', async () => {
    const response = await getAuthRoles('read');
    expect(response).toEqual({
        data: [],
        error: null,
    });
});

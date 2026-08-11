import { DateTime } from 'luxon';

import { getElapsed } from 'src/components/shared/Entity/Details/Overview/shared';

const agoBySeconds = (seconds: number) => DateTime.now().minus({ seconds });

describe('getElapsed', () => {
    // The whole point of this formatter. Stats reach the page through two
    // rollups and a materialization, measured at a ~270s floor across two
    // unrelated tenants, so a seconds reading would be invented precision. The
    // old implementation rendered "8 seconds" on a local stack, which has no
    // such floor, and that is what hid the problem.
    test('never reports seconds, even for an instant ago', () => {
        expect(getElapsed(agoBySeconds(3))).toEqual({
            unitLabelId: 'detailsPanel.elapsed.minutes',
            value: 1,
        });
    });

    test('reports the reporting floor as a few minutes', () => {
        expect(getElapsed(agoBySeconds(270))).toMatchObject({
            unitLabelId: 'detailsPanel.elapsed.minutes',
            value: 5,
        });
    });

    test('reports minutes under an hour', () => {
        expect(getElapsed(agoBySeconds(31 * 60))).toMatchObject({
            unitLabelId: 'detailsPanel.elapsed.minutes',
            value: 31,
        });
    });

    test('reports hours under a day', () => {
        expect(getElapsed(agoBySeconds(5 * 3600))).toMatchObject({
            unitLabelId: 'detailsPanel.elapsed.hours',
            value: 5,
        });
    });

    test('reports days beyond that', () => {
        expect(getElapsed(agoBySeconds(3 * 86400))).toMatchObject({
            unitLabelId: 'detailsPanel.elapsed.days',
            value: 3,
        });
    });

    // Clock skew between the browser and the control plane can put a timestamp
    // slightly in the future; "-3 minutes ago" would be worse than "1 minute".
    test('clamps a future timestamp rather than going negative', () => {
        expect(getElapsed(agoBySeconds(-30)).value).toBeGreaterThanOrEqual(1);
    });
});

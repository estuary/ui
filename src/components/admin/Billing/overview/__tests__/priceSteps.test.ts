import { describe, expect, test } from 'vitest';

import {
    rateRows,
    usageMeter,
} from 'src/components/admin/Billing/overview/priceSteps';

const tier = (rateCents: number, quantity: number | null = null) => ({
    rateCents,
    quantity,
});

// Self-serve defaults.
const cloudData = [tier(50)];
const cloudHours = [tier(14, 4464), tier(7)];
// A contract includes usage as leading tiers at no charge.
const contractData = [tier(0, 1024), tier(50)];
const contractHours = [tier(0, 1440), tier(14, 1440), tier(10)];

describe('usageMeter', () => {
    test('a single rate has no steps', () => {
        expect(usageMeter(cloudData, 820.4, 'data')).toEqual({
            steps: [],
            quantity: '820 GB at $0.50/GB',
            next: 'Flat rate',
        });
    });

    test('fills the current step and leaves later ones empty', () => {
        expect(usageMeter(cloudHours, 1940, 'hours')).toMatchInlineSnapshot(`
          {
            "next": "Next drop at 4,464 h",
            "quantity": "1,940 h used",
            "steps": [
              {
                "fillPercent": 43.45878136200717,
                "heightPercent": 100,
                "label": "$0.14/h · 1,940 h",
                "state": "current",
                "tooltip": "$0.14/h, first 4,464 task hours",
              },
              {
                "fillPercent": 0,
                "heightPercent": 56,
                "label": "$0.07/h",
                "state": "later",
                "tooltip": "$0.07/h, over 4,464 task hours",
              },
            ],
          }
        `);
    });

    test('fills passed steps and draws the open last step past usage', () => {
        expect(usageMeter(cloudHours, 5840, 'hours')).toMatchInlineSnapshot(`
          {
            "next": "Lowest rate",
            "quantity": "5,840 h used",
            "steps": [
              {
                "fillPercent": 100,
                "heightPercent": 100,
                "label": "$0.14/h · 4,464 h",
                "state": "passed",
                "tooltip": "$0.14/h, first 4,464 task hours",
              },
              {
                "fillPercent": 30.824372759856633,
                "heightPercent": 56,
                "label": "$0.07/h · 1,376 h",
                "state": "current",
                "tooltip": "$0.07/h, over 4,464 task hours",
              },
            ],
          }
        `);
    });

    test('counts included usage until it runs out', () => {
        expect(usageMeter(contractData, 820, 'data')).toMatchObject({
            quantity: '820 GB of 1,024 GB included',
            next: 'Billed after 1,024 GB',
        });
        expect(usageMeter(contractData, 1445, 'data')).toMatchObject({
            quantity: '421 GB over the 1,024 GB included',
            next: 'Billed at $0.50/GB',
        });
        expect(usageMeter(contractHours, 1940, 'hours')).toMatchObject({
            quantity: '500 h over the 1,440 h included',
            next: 'Next drop at 2,880 h',
        });
    });
});

test('rateRows lists each tier and marks the current one', () => {
    expect(rateRows(cloudData, 820, 'data')).toEqual([
        { range: 'Any volume', rate: '$0.50/GB', current: true },
    ]);
    expect(rateRows(contractHours, 1940, 'hours')).toEqual([
        { range: 'First 1,440 task hours', rate: 'Included', current: false },
        {
            range: '1,440 – 2,880 task hours',
            rate: '$0.14/h',
            current: true,
        },
        { range: 'Over 2,880 task hours', rate: '$0.10/h', current: false },
    ]);
});

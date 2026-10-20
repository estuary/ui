import type { ReactNode } from 'react';
import type { CountryCode } from 'src/components/onboarding/DataPlanePicker/dataPlaneMetadata';

import { Box } from '@mui/material';

// Simplified flags drawn on a shared 10:7 canvas. Inline SVG rather than
// emoji, because Windows does not render flag emoji.
const WIDTH = 20;
const HEIGHT = 14;

// Displayed slightly smaller than the canvas, as in the design.
const DISPLAY_WIDTH = 18;
const DISPLAY_HEIGHT = 13;

const US_STRIPE = HEIGHT / 13;

const UnitedStates = (
    <>
        <rect width={WIDTH} height={HEIGHT} fill="#FFFFFF" />
        {Array.from({ length: 7 }, (_, index) => (
            <rect
                key={index}
                y={index * 2 * US_STRIPE}
                width={WIDTH}
                height={US_STRIPE}
                fill="#B22234"
            />
        ))}
        <rect width={8} height={US_STRIPE * 7} fill="#3C3B6E" />
        {Array.from({ length: 12 }, (_, index) => (
            <circle
                key={index}
                cx={1.25 + (index % 4) * 1.85}
                cy={1.3 + Math.floor(index / 4) * 2.4}
                r={0.4}
                fill="#FFFFFF"
            />
        ))}
    </>
);

const Ireland = (
    <>
        <rect width={WIDTH / 3} height={HEIGHT} fill="#169B62" />
        <rect x={WIDTH / 3} width={WIDTH / 3} height={HEIGHT} fill="#FFFFFF" />
        <rect
            x={(WIDTH / 3) * 2}
            width={WIDTH / 3}
            height={HEIGHT}
            fill="#FF883E"
        />
    </>
);

const Australia = (
    <>
        <defs>
            <clipPath id="country-flag-au-canton">
                <rect width={10} height={7} />
            </clipPath>
        </defs>
        <rect width={WIDTH} height={HEIGHT} fill="#012169" />
        <g clipPath="url(#country-flag-au-canton)">
            <path d="M0 0L10 7M10 0L0 7" stroke="#FFFFFF" strokeWidth={1.4} />
            <path d="M0 0L10 7M10 0L0 7" stroke="#C8102E" strokeWidth={0.5} />
            <path d="M5 0V7M0 3.5H10" stroke="#FFFFFF" strokeWidth={2.2} />
            <path d="M5 0V7M0 3.5H10" stroke="#C8102E" strokeWidth={1.2} />
        </g>
        <g fill="#FFFFFF">
            <circle cx={5} cy={10.5} r={1.3} />
            <circle cx={15} cy={2.6} r={0.75} />
            <circle cx={12.4} cy={6.4} r={0.75} />
            <circle cx={17.6} cy={5.8} r={0.75} />
            <circle cx={15} cy={11.4} r={0.75} />
            <circle cx={16.4} cy={8.2} r={0.45} />
        </g>
    </>
);

const FLAGS: Record<CountryCode, ReactNode> = {
    AU: Australia,
    IE: Ireland,
    US: UnitedStates,
};

interface CountryFlagProps {
    country: CountryCode | null;
}

export const CountryFlag = ({ country }: CountryFlagProps) => {
    const flag = country ? FLAGS[country] : null;

    // Decorative: the region name beside it already says where it is. Keep
    // the slot when there is no flag so names line up across options.
    return (
        <Box
            sx={{
                flexShrink: 0,
                width: DISPLAY_WIDTH,
                height: DISPLAY_HEIGHT,
                display: 'flex',
                borderRadius: '1.5px',
                overflow: 'hidden',
                boxShadow: flag
                    ? (theme) => `0 0 0 1px ${theme.palette.divider}`
                    : undefined,
            }}
        >
            {flag ? (
                <svg
                    width={DISPLAY_WIDTH}
                    height={DISPLAY_HEIGHT}
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    preserveAspectRatio="none"
                    aria-hidden
                >
                    {flag}
                </svg>
            ) : null}
        </Box>
    );
};

import { useEffect, useRef, useState } from 'react';

import { Box, Collapse, DialogContent } from '@mui/material';

import AlertBox from 'src/components/shared/AlertBox';
import { useWizard } from 'src/components/shared/WizardDialog/context';

// Renders the active step's component with an animated height transition between steps.
// Uses a ResizeObserver to track content size changes within a step.
export function WizardContent() {
    const { steps, currentStep, error } = useWizard();

    // Ref to the inner wrapper whose scrollHeight drives the animated outer container height
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number | undefined>(undefined);
    const [transitioning, setTransitioning] = useState(false);
    const prevStepRef = useRef(currentStep);

    useEffect(() => {
        if (prevStepRef.current !== currentStep) {
            setTransitioning(true);
            prevStepRef.current = currentStep;
        }

        const el = contentRef.current;
        if (!el) return;

        setHeight(el.scrollHeight);

        const observer = new ResizeObserver(() => {
            setHeight(el.scrollHeight);
        });
        observer.observe(el);

        return () => observer.disconnect();
    }, [currentStep]);

    const currentStepConfig = steps[currentStep];

    if (!currentStepConfig) {
        return null;
    }

    return (
        <DialogContent>
            <Collapse in={Boolean(error)}>
                <AlertBox short severity="error" sx={{ mb: 2 }}>
                    {error}
                </AlertBox>
            </Collapse>
            <Box
                onTransitionEnd={() => {
                    setTransitioning(false);
                }}
                sx={{
                    height: height ?? 'auto',
                    // content height is only animated during step transitions, not during internal resizes
                    // (to avoid jankiness while user interacts with the content)
                    transition: transitioning
                        ? 'height 300ms ease-in-out'
                        : 'none',
                }}
            >
                <Box ref={contentRef}>{currentStepConfig.component}</Box>
            </Box>
        </DialogContent>
    );
}

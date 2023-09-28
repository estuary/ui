import { useEffect, useMemo, useState } from 'react';
import { useInterval } from 'react-use';

const linearProgressInterval = 500;
const maxProgress = 100;

const calculateProgression = (
    wait: number | undefined,
    interval: number | null
) =>
    interval && wait
        ? Math.round((maxProgress / wait) * interval)
        : maxProgress;

// Hook used to return a progress indicator from 0 - 100 over a certain wait time
//  wait MUST be passed in as milliseconds
function useProgressTimer(wait?: number) {
    // Update twice per second to feel snappy but not too many updates in the UI
    const [interval, setInterval] = useState<number | null>(
        wait ? linearProgressInterval : null
    );

    // Figure out how much each tick should add to the progress
    const progression = useMemo(
        () => calculateProgression(wait, interval),
        [wait, interval]
    );

    // Start right away with some progress
    const [progress, setProgress] = useState(progression);

    // Handle if wait is flipping back to not being set and force the interval to stop
    useEffect(() => {
        setInterval(wait ? linearProgressInterval : null);
    }, [wait]);

    // Start loop that will keep updating the progress
    useInterval(() => {
        setProgress((oldProgress) => {
            if (oldProgress === maxProgress) {
                // Now that we're done we should restart if there is a wait time
                setInterval(wait ? linearProgressInterval : null);
                return calculateProgression(wait, interval);
            }

            // Calculate the new progress and make sure it doesn't go over 100
            return Math.min(oldProgress + progression, 100);
        });
    }, interval);

    return progress;
}

export default useProgressTimer;

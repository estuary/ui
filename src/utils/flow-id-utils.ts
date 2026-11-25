// Flow ids are 64 bits: millis since the Estuary epoch, then a 13-bit sequence
// number and a 10-bit shard. See `Id::timestamp` in flow's `models` crate.
const ESTUARY_EPOCH_MILLIS = BigInt(1_600_000_000_000);
const NON_TIMESTAMP_BITS = BigInt(23);

/**
 * Returns the time the given flow id was generated.
 * Expects `flowId` to be in hex form with or without colons,
 * e.g. `167161ff29857800` or `16:71:61:ff:29:85:78:00`
 */
export function getIdTimestamp(flowId: string) {
    const id = `0x${flowId.replaceAll(':', '')}`;
    // shift the id 23 bits to get the timestamp part
    const msSinceEpoch = BigInt(id) >> NON_TIMESTAMP_BITS;
    const timestamp = msSinceEpoch + ESTUARY_EPOCH_MILLIS;
    return new Date(Number(timestamp));
}

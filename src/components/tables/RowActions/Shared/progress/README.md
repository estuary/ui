# Why are there two progress components?

The `Grouped` and `Individual` progress components are _almost_ the exact same component. I think we should end up making them a single component in the future. However, this should probably wait a little bit.

# When can we get rid of these two copies?

We want to make sure our `Grouped` deletes are working as expected. Also, when we make them shared we'll probably want to make sure the `UpdateEntities` and `UpdateEntity` share more code through hooks.

This requires a lot of effort into controlling those updates to create a single draft, validate specs when needed, and only query for the information they require.

This is a lot of work to get done right now (Q4 2025)

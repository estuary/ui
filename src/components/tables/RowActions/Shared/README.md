# Why are there two of a lot of components?

The `Grouped` and `Individual` progress components are _almost_ the exact same. I think we should end up making them a single component in the future. However, this should probably wait a little bit.

# When can we get rid of these two copies?

We want to make sure our `Grouped` deletes are working as expected first. After that, we can merge them in and handle all the small tweaks that they will need. This is a lot of typing, dynamic queries, dynamic messaging, and hooks to share functionality.

This is a lot of work to get done right now (Q4 2025)

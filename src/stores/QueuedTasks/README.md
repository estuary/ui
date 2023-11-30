This is not being used right now. However, eventually we know we want to make the ui not force users into feeling like all the async actions are synchronous. So leaving the tiny bit of work here.

Here are random notes/ideas when thinking about how to solve this

### store shape

publications: {
query: queryBuilder?
`${ id }`: {
stuff?...
response: {
created,
updated,
logs token,
draft id,
dry run,
evolve,
job status
}
}
}
discovers: {
`${ id }`: {
stuff?...
response: {
capture name,
created,
updated,
logs token,
draft id,
connector tag id,
job status
}
}
}
evolves?

### Implementations Needed:

add, remove, progress, post handler (success and error)

As queued tasks are started we need to keep adding to store. Also cleaning up as they finish? Maybe only have reaching a limit?

-   Might be easier to just use LRUMap?

Need to be able to run "background" and "foreground" tasks.

-   Probably set some kind of flag
-   How will components consume this?

### Thoughts/Questions

How do we decide what we care about?

-   Needs to work for a user reloading page
-   May need to store list of IDs in local storage
-   Possibly monitor all of the last N-tasks?

Do we need to handle a user getting notified of success after reloading?

-   If a user kicks off a test and reloads do we want to land them back right where they were?

When logging out / lose access how do we clean up?

-   If we keep this in memory/store we're good.

Should all async/queued tasks allow the user to leavea nd come back?

-   Example - Do we want users leaving/coming back to schema evolutions?

How do we build up a query so only one call is made for multiple tasks?

-   We do not want to keep sending more and more pings so need to build up a query
-   As tasks start - add the key to the query
-   As tasks finish - remove the key from the query

Do we care what component fired the event?

-   Linking back could be nice to include some CTA that leads back to what started the call
-   Could be used to control what components show loading and which don't

Do we need to show progress to the user?

-   Does it matter a task is sitting in queued for 10 vs 30 vs 60 seconds?

How does chaining work?

-   We might not need to worry about this but good to keep in mind.

How do retries work?

-   Should be handled by promise library we use elsewhere - but need to make sure it works.

### How do failures work?

```
  Do we need to always enter edit?
  Timeout... never seen by the user / keep checking
  Race condition
    yes...
    need human readable error
    Need to make sure the user sees what the new config is
    Do users need to know what/who conflict?
    Do we make it simply a message in the section that contains changes?
  Misc Errors
    reopen where they were

  Discover errors
    Create
      Enter the flow again

    Race condition
      Almost always end up just starting edit over again
```

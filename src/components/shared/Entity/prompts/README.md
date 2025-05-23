### General Overview

A prompt is a `stepper` that is shown before an action is taken. The idea is to ask the user for confirmation, making a selection, more information, etc. before a final action is taken. As of Q4 2024 this is only used for `Data Flow Reset`.

### Technical Overview

A `prompt` is currently a dialog that is made up of `Title`, `Actions`, and `Content`(this consumes a list of `step`s to know what to render).

#### Prompts

To create a `prompt` you need to add a {[`promptNameKey`]:`PromptSettings`} to the `PROMPT_SETTINGS` object stored in the `src/settings/prompts` file. This stores the dialog title key, logging prefix, and what `steps` are included. _!WARNING!_ The order of the `steps` array is the order of how they will be looped through.

For a `prompt`'s `step`s you should keep everything in a `./steps/{prompt name}/{step name}` directory.

#### Steps

To create a `step` for a `prompt` you need to add a `PromptStep` to the `definitions` file in `./steps/definitions.ts`. This is a dictionary of `key` and `promptstep`. The `promptStep` contains everything _required_ to render the`step`.

In addition, each `step` has an _optional_ `types` files that stores the interface of what data that `step` _adds_ to the context.

#### Notes

We do some weird "breaking up" to prevent circular dependencies with the stores.

All this is _really_ close to a finite state machine. However, _it is NOT_ one!

### Assumptions made in code

This entire thing RUNS on assumptions... and sadly not all of them are clearly listed. Some off the top of my head - all `step`s will be gone through in order, each non-publishing `step` will update its own status, common `step`s are shared, the `step`s will NOT change while in the middle of a flow (though I think this is probably somewhat safe to do... _maybe_), and some more.

_Be careful and talk to someone before expanding this_

### Future Plans

Need to decide if we will stick with this custom version or convert to an out of the box version. We also need to decide if we want to put in the extra effort to use a _finite_ state machine or not.

Either way - probably need to end up making a mixin/base for stores so the idea of a `step` that contains a prompt can be shared.

The main logic of each `step` lives inside the component. This should probably be moved into a hook.

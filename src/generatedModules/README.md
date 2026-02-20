# What is this?

This is where we store our modules that have been generated with coding automation tools like Claude.

We store these in a specific place as previously we probably would have installed a dependency from NPM. Because they are now inline it means we won't get "automagic" updates as UI/UX industry changes. This is important because previously we might get updates that would help keep them inline with more modern UX approaches and user expectations.

The hopes is that keeping these as stand alone "modules" will help keep them still feeling like a dependency and reduce the chance we make them with _too many_ assumptions when making them. Also, it makes for a nice place to periodically run a audit/scan/review/etc. on them and ensure they are not outdated in their approach.

It is important when you are generating these that you give the same due diligence you would when selecting one to install. You need to review the solution deeply and ensure that there is nothing risky.

# Modules

## [FileUpload](src/generatedModules/FileUpload)

Replaced `react-mui-dropzone`

Generated during the MUI 7 upgrade due to `react-mui-dropzone` not supporting the latest icon library. This was not a deeply integrated dependency so we decided to replace it. We reduced the possible functionality to only what we needed, used `icon-noir` icons, and added basic keyboard accessibility.

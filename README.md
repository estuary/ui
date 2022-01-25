# Estuary UI

The web UI for Estuary Flow.

# How to install?

You'll need to make sure the UI and the test server have all the depencies installed. For the UI this should be straight forward and running `npm install` in the UI root directory. The test server might be a bit more complex. See the README in the `temp-test-server` for details on that.

# How do I run the UI?

You need to run with Node 16 right now. There is an issue with Node 17.

You can run both apps from a single command if you just want to play around. If you try this for dev it'll get funky and we do not recommend it.

`npm run start-all` starts UI and test server together (not good for dev)
`npm start` starts UI

For more details on UI commands please look at `build.md`.
For more details on the test server look in the directory `temp-test-server`.

# What is the status?

The status very much a "work in progress"... or like one level above a proof of concept.

# Building Blocks

This project was started using [Create React App](https://create-react-app.dev/) and [added TypeScript](https://create-react-app.dev/docs/adding-typescript).

As we are currently using [MUI](https://mui.com/core/) as our main component library so we used [their typescript template](https://github.com/mui-org/material-ui/tree/master/examples/create-react-app-with-typescript) as a reference for this project. We combined some of their tsconfig settings with those found from [typescript-cheatsheets](https://github.com/typescript-cheatsheets/react#troubleshooting-handbook-tsconfigjson).

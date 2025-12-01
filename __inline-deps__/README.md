# Why this is here

We are copying the `data-plane-gateway` into the UI as a quick temporary solution as we move away from the current approach. Our previous solution of using `gitpkg` app had an issue when it went down. Also, this is not the greatest solution as it _really_ trusts whoever runs this application.

To replace that we decided to just copy in the code. This is temporary (started Q4 2025)

# How to update the data-plane-gateway

You will need to make sure you have the latest `data-plane-gateway` checked out locally

Then in the `UI` repo you need to run the command below. Make sure your path ends with a slash

```
npm run hack-in-dpg /...PATH_TO_REPO.../data-plane-gateway/
```

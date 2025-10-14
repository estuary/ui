# Overview

We are migrating from PostgREST to GQL for.

To prevent us from having to solve everything at once sticking with some ideas/approaches that DO NOT scale and we are fine with that right now. We will make things better slowly as we go and learn more about what we want this to look like.

# Decisions (as of Q4 2025)

## Typing

Currently manually typing in the UI and not using any CodeGen. This makes the impacts to build/deploy basically nothing. I doubt we will continue manually typing as it is somewhat costly - but since we mainly just use GQL for `alerts` right now it isn't that bad.

We will keep all the types in a single GQL file for now (ui/src/types/gql.ts).

## Client Library: URQL

This is our client solution primarily because it is very bare bones and seems to be easy to extend as we need.

## Helpers / Utils

The single fragment we have right now into a "service" for GQL (ui/src/services/gql.ts). However, it is doubtful that we will stick with this pattern in the long run.

## Hooks

There will be needed helpful hooks for sure (like pagination) but want to make sure there is better understanding on what they should be before making them. Currently the only component using GQL Pagination is the AlertHistory table (ui/src/components/tables/AlertHistory/index.tsx).

Strongly doubt we will go down the same path as with useSWR and write a bunch of wrappers around GQL as that just ended up just causing more issues than it fixed.

## Exploration

This will be powered by GraphiQL and is hosted from `flow` but can be accessed through the UI by going to [http://localhost:3000/test/gql](http://localhost:3000/test/gql)

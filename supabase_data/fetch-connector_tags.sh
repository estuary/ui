#!/bin/bash

# Fetches all the connector tags from Supabase

mkdir -p bin
rm -f bin/*
cd bin
curl -o connector_tags.json 'https://eyrcnmuzzyriypdajwdk.supabase.co/rest/v1/connector_tags?select=*' \
-H "apikey: __paste-key-from-env-here__" \
-H "Authorization: Bearer __paste-your-auth-key-here__"
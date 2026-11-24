FROM nginx:alpine

# Pick up Alpine security fixes that land before the upstream nginx image is rebuilt
RUN apk upgrade --no-cache

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./ /usr/share/nginx/html/
# Delete the build files so nginx doesn't serve our config or this Dockerfile.
# Cloud Run builds from ./build/, so both files have to be in the build context;
# COPY can't skip individual files, so we remove them after copying.
RUN rm /usr/share/nginx/html/nginx.conf /usr/share/nginx/html/Dockerfile


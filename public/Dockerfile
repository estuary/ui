FROM nginx:alpine

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./ /usr/share/nginx/html/
# Delete the nginx.conf file so that we don't serve our config via nginx
# This is because I don't know an easier way to COPY all files _except_ that one.
RUN rm /usr/share/nginx/html/nginx.conf


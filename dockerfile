FROM alpine:3.12.1

# Update, upgrade and install necessary
RUN apk update && \
    apk upgrade
RUN apk --no-cache add git libgit2-dev tzdata g++ gcc libffi-dev openssl-dev libc-dev make

# Install Node
RUN apk add --update nodejs npm

# Install Python3
RUN apk add --no-cache python3
RUN apk add --update py3-pip

# Install Docker necessary
RUN apk add --no-cache docker-cli
RUN apk add --no-cache --virtual .docker-compose-deps python3-dev
RUN pip3 install docker-compose && \
    apk del .docker-compose-deps

# Copy source to image
COPY docker-entrypoint.sh /docker-entrypoint.sh
COPY src /nodejs/src
COPY package.json /nodejs/.
COPY package-lock.json /nodejs/.

# Run npm install
WORKDIR /nodejs/
RUN npm install

# Change permission of docker-entrypoint.sh
RUN chmod 777 /docker-entrypoint.sh

# Entrypoint
ENTRYPOINT [ "/docker-entrypoint.sh" ]
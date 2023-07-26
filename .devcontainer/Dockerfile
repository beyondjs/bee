FROM ubuntu:focal

# Set the working directory in the container
WORKDIR /workspaces/asyncframe

ENV LANG="C.UTF-8"

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get upgrade -y \
    && apt-get install git curl apt-transport-https ca-certificates gnupg -y \
    && apt-get clean -y

RUN curl -sL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - 


RUN echo "deb https://deb.nodesource.com/node_18.x buster main" > /etc/apt/sources.list.d/nodesource.list \
    && echo "deb-src https://deb.nodesource.com/node_18.x buster main" >> /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get clean -y

RUN apt-get install nodejs -y

# Install gcloud client
# RUN echo "deb [sig]ned-by=/usr/share/keyrings/cloud.google.gpg] http://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg  add - && apt-get update -y && apt-get install google-cloud-cli -y

# Restore man command
RUN yes | unminimize 2>&1

# Install beyond
RUN npm i -g beyond@1.1.0-beta.dts.9 @beyond-js/packages-templates
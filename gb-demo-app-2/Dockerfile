FROM node:14 as build-stage
MAINTAINER Maxkuku for GeekBrains lesson <maxkuku@gmail.com>
USER root
ENV APPLICATION_NAME=gb-demo-app-2
ENV SASS_BINARY_PATH=/opt/$APPLICATION_NAME/bin/vendor/linux-x64/binding.node
RUN npm ci
COPY package.json package-lock.json ./
RUN npm ci
COPY ./ ./
RUN npm run test
RUN npm run build
RUN npm prune --production
FROM node:12-alpine as production-stage
ENV APPLICATION_NAME=gb-demo-app-2
ENV NODE_ENV=production
WORKDIR /opt/$APPLICATION_NAME
COPY --from=build-stage /opt/$APPLICATION_NAME/node_modules /opt/$APPLICATION_NAME/node_modules
## Error response from daemon: Dockerfile parse error line 18: unknown instruction: /OPT/$APPLICATION_NAME/NODE_MODULES
COPY --from=build-stage /opt/$APPLICATION_NAME/dist/ /opt/$APPLICATION_NAME/start.sh /opt/$APPLICATION_NAME/
EXPOSE 3001
CMD ["node", "apps/api/main.js"]


# docker build -t gb-demo-app-2 .
# docker run -d -p 80:3001 gb-demo-app-2
# docker ps - see containers list

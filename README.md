# SSErve
Simple NodeJS SSE server and client

This is a simple implementation of SSE server using ExpressJS, and also there is a client listener implementation.  It contains a simple API Key/Token verification middleware on the events listening route.  It will verify against MongoDB in this implementation.

Apart from the simple implementation of SSE server, there is a MongoDB watcher class implemented that allows you to listen to any collection data changes.  Check package.json for running unit tests and database unit tests.

/events route is the listening URL
/test route is the test route to send a message to the listening client
The API Key/Token should be set on the Authorization header if you want to listen using plain EventSource from a browser
Or you can just use the provided SseClient class

**Example Environment Variables used to configure server application**
SERVER_PORT=1337
MONGO_URL=mongodb://localhost:27017/?replicaSet=rs0
MONGO_DBNAME=sserve
SSE_CLIENT_RETRY=60000

To be able to watch for MongoDB changes, your MongoDB instance needs to be run as a replica set

Start your local server as (windows command)
```mongod.exe --replSet <replica set name>```

To initialize your replicaset, log into your mongo instance with shell command and run below command
```rs.initiate()```

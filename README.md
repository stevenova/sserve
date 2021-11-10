# SSErve (Feature Toggle SSE Server)
Simple NodeJS SSE server and client.  Well, it started as a implementation of a simple SSE server, but the real motivation for the creation of this project was to create a Toggle or Flags server and client, using SSE (Server Sent Events) as the way of communication from server to client.  Why SSE?  The client does not need two (2) way communication, since the client only needs to know about any toggles changes (changes in value).  The client will not be changing any value on the toggle.

The server is build using NodeJS and ExpressJS mainly.  It contains a simple API Key/Token verification middleware on the events listening route. MongoDB will be used as storage for the toggles, flags, or feature toggles, or however you would like to call it.

**How to run the server**
Before running the server, you have to build the project, because it is written in Typescript by running executing
```npm run build```
Starting up the server
```npm run start:server```

**Configuration**
The server can be configured using **environment variables**
**SERVER_PORT**=1337
**MONGO_URL**=mongodb://localhost:27017/?replicaSet=rs0
**MONGO_DBNAME**=sserve
**SSE_CLIENT_RETRY**=60000

**Database (MongoDB)**
In order to be able to watch changes from MongoDB, we need to run a MongoDB instance with replica set.  Running it as a single node will not work.  The way to make it work, at least in Windows is the following:
Start MongoDB server with the following command, replacing ```<replica set name``` with a name you want to use, in our example, I am using **rs0**, as you can see in the **MONGO_URL** environment variable value
```mongod.exe --replSet <replica set name>```
After starting up, login into your MongoDB instance using ```mongo``` shell command.  While in shell, run the command:
```rs.initiate()```
After doing that, you are already set.

**Client (Connecting to the server)**
In the project, there is already a class ```SseClient``` provided that you can configure to connect to the server, or you can just use the [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) to connect to the server, since the server is a standard SSE server.  If you run the database unit tests, you will have a test toggle entry and also a test account entry.

The URL for connecting would be the ```server:port/events?environment=test```, if you are running locally, then it would be ```http://localhost:1337/events?environment=test```, assuming that the default port number was not changed.  The ```environment``` query parameter is to specify which environment's toggles it is going to be listening to.  You have to provided an **API Key** or **API Token** in the ```authorization``` request header, so that the server can validate your connection.  ```Authorization: Bearer <api key>```  The server will validate against the **account** collection in MongoDB, and allow you to listen or reject.

If you are connecting using [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource), then you will have to provide callback functions to ```onmessage, onerror, onopen``` in order to listen for updates.  If you are using the ```SseClient``` or ```ToggleSseClient```, then you have to provide callback functions to ```onData, onConnect, onError```.  You can check the ```tests``` folder for examples on how to use it.

**Unit tests**
There are unit test for normal functionality, database, and client.  Commands are listed below:
```npm run test``` Running normal tests
```npm run test:db```  Running tests requires database connection
```npm run test:client```  Running tests that connects to the server, which means that the server is required to be running.  It is preferable to start the server with ```npm run start:server:test``` to enable starting up the server in test mode, which makes the server send SSE messages to connected client every 5 seconds.

**How the client works**
```SseClient```
This class is the simple client that connects and listens, nothing else
```ToggleSseClient```
This class extends from ```SseClient``` and listens and processes toggle changes internally, by storing them in its internal cache.  It has ```getCachedValue()``` method, that returns the set of toggles for your environment.  It also has ```getToggleValue(name: string)``` method that returns the value for the specific toggle you value you want.  These are synchronous methods.  So it will give you what's on the client's cache.  Internally it listens for server sent events, and will update the cache, and you consume from the cache.  There are no straight request of values to the server.  The client only listens.

Hope anyone checking this project enjoyed reading this not very professional documentation of the project.

# Network physics

Work in progress for running CANNON.js simulation remotely, intended to allow a very similar physics
APIs whether the simulation itself is executed in the main application, through a ServiceWorker, or
on a remote server.

Future work may consider other client/server syncing models, but right now this is very much a
centralized "one simulation" approach.

Node.js API that connects to the MongoDB database and returns all messages that have not yet been sent. This API also allows messages to be marked as sent so they are no longer returned.

Use the following commands to deploy with Docker:

```
sudo docker pull meshrelay0/meshrelay-meshapi-messages-sms:latest
sudo docker run -d -p 80:3060 \
--name meshapi-messages-sms \
--network network_name \
  -e MONGODB_URI=mongodb_uri \
  meshrelay0/meshrelay-meshapi-messages-sms:latest
```

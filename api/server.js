/**
 * A very basic cluster-based server runner. Restarts failed workers, but does
 * not much else right now.
 */

var cluster = require('cluster');
var app = require('./ParserService.js');
// Start a few more workers than there are cpus visible to the OS, so that we
// get some degree of parallelism even on single-core systems. A single
// long-running request would otherwise hold up all concurrent short requests.
var numCPUs = require('os').cpus().length + 3;

if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('death', function(worker) {
    console.log('worker ' + worker.pid + ' died, restarting.');
	// restart worker
	cluster.fork();
  });
} else {
  app.listen(8000);
}

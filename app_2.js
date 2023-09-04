/**
 * Module dependencies.
 */
var debug = require('debug')('contineo-restapi:server');
var http = require('http');

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

/*const socketPath = '/tmp/ipc.sock';

const ipc = require('node-ipc').default;

ipc.config.unlink = false;


const pm2Id = process.env.pm_id;
ipc.config.id   = `instance_${pm2Id}`;
ipc.config.retry= 1500;

ipc.connectTo(
    'agent',
    function(){
        ipc.of.agent.on(
            'connect',
            function(){
                ipc.log('## connected to agent ##'.rainbow, ipc.config.delay);
                
                ipc.of.agent.emit(
                    'started',  //any event or message type your server listens for
                    {
                        id          : pm2Id,
                        message     : 'STARTED',
                        pid         : process.pid,
                        from        : ipc.config.id
                    }
                )
            }
        );
        ipc.of.agent.on(
            'disconnect',
            function(){
                ipc.log('disconnected from agent'.notice);
            }
        );
        ipc.of.agent.on(
            'message',  //any event or message type your server listens for
            function(data){
                console.log("AGENT MSG",data);
                ipc.log('got a message from agent : '.debug, data);
            }
        );

        ipc.of.agent.on(
            'stop',
            function(data){

                console.log("AGENT MSG",data);
                ipc.log('got a message from agent : '.debug, data);

                ipc.of.agent.emit(
                    'stopped',
                    {
                        id          : pm2Id,
                        message     : 'STOPPED',
                        pid         : process.pid,
                        from        : ipc.config.id
                    }
                );

            }
        );
    }
);

console.log(`pid ${process.pid} listening on ${socketPath}`);*/



var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


/**
 * Listen on provided port, on all network interfaces.
 */
var server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

//--------------------------------------------------------
// IPC Client connection
//--------------------------------------------------------

let ipcClientClass =  require("./services/ipc-client.js")
new ipcClientClass().connectTo({
    "server" : server
});

/*process.on('SIGINT', function() {
   server.close(function(err) {
    console.log("process.exit");
    process.exit(err ? 1 : 0);
   });
});*/

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  /*process.send('ready');*/
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;

  console.log(`Server is running on http://localhost:${addr.port}`);  
  debug('Listening on ' + bind);
}

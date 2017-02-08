import { env, argument } from 'chen/core';

export default {

  app: {

    /**
     * Environment mode. Be sure to set to 'production' in a production environment
     * @type {String}
     */
    env: env('APP_ENV', 'production'),

    /**
     * This key is used by Hash.make() and should be set
     * to a random, 32 character string, otherwise these encrypted strings
     * will not be safe. Please do this before deploying an application!
     * @type {String}
     */
    key: env('APP_KEY', 'key'),
    cipher: 'AES-256-CBC',

    /**
     * When your application is in debug mode, detailed error messages with
     * stack traces will be shown on every error that occurs within your
     * application. If disabled, a simple generic error page is shown.
     * @type {String}
     */
    debug: env('APP_DEBUG', true),

    /**
     * Protocol and host is used by the console to properly generate URLs when using
     * the Artisan command line tool. You should set this to the root of
     * your application so that it is used when running Artisan tasks.
     * @type {String}
     */
    protocol: env('APP_PROTOCOL', 'http'),
    host: env('APP_HOST', 'localhost'),

    /**
     * When you start the application it binds and listens for connections on the specified port
     * @type {Number}
     */
    port: argument('port', 3000),

    /**
     * Default timezone for your application
     * @type {String}
     */
    timezone: 'Asia/Manila',

    /**
     * The application locale determines the default locale that will be used
     * by the language service provider. You are free to set this value
     * to any of the locales which will be supported by the application.
     * @type {String}
     */
    locale: 'en'
  },

  auth: {

    /**
     * This option controls the default authentication 'guard' for your application.
     * You may change these defaults as required, but they're a perfect start for most applications.
     * @type {String}
     */
    default: 'site',

    /**
     * Next, you may define every authentication guard for your application.
     * Of course, a great default configuration has been defined for you
     * here which uses the builtin SessionAuthService and User model.
     *
     * All authentication guards should have a 'model' to represent the authenticated user.
     * You may also put a 'service' to customize how the
     * users are actually retrieved out of your database or other storage
     * mechanisms used by this application to persist your user's data.
     * @type {Object}
     */
    guards: {
      site: {
        model: 'User'
      }
    }
  },

  logger: {

    /**
     * This option controls whether to include assets on logging.
     * @type {Boolean}
     */
    includeAssets: true,

    /**
     * You can change the format of logs. Here are the supported formats:
     * combined
     * :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
     * common
     * :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]
     * dev
     * :method :url :status :response-time ms - :res[content-length]
     * short
     * :remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms
     * tiny
     * :method :url :status :res[content-length] - :response-time ms
     * @type {String}
     */
    format: 'short'
  },

  socketio: {
    options: {

      /**
       * if true the socketio will serve the client files
       * @type {Boolean}
       */
      serveClient: true,

      /**
       * Sets the path under which socketio and the static files will be served
       * @type {String}
       */
      path: '/socket.io'
    }
  },

  router: {

    /**
     * Enable case sensitivity.
     * Disabled by default, treating '/Foo' and '/foo' as the same.
     * @type {Boolean}
     */
    caseSensitiveRouting: false,

    /**
     * Enable strict routing.
     * Disabled by default, '/foo' and '/foo/' are treated the same by the router.
     * @type {Boolean}
     */
    strictRouting: false
  },

  database: {

    /**
     * Here you may specify which of the database connections below you wish
     * to use as your default connection for all database work. Of course
     * you may use many connections at once using the Database library.
     * @type {String}
     */
    default: 'default',

    /**
     * All database work in Chen is done through the Knexjs http://knexjs.org/
     * so make sure you have the driver for your particular database of
     * choice installed on your machine before you begin development.
     * @type {Object}
     */
    connections: {

      default: {
        client: 'mysql',
        connection: {
          host: env('DB_HOST', 'localhost'),
          user: env('DB_USERNAME', 'root'),
          password: env('DB_PASSWORD', ''),
          database: env('DB_DATABASE', 'database'),
          charset: 'utf8'
        },
        debug: env('DB_DEBUG', false)
      }
    }
  },

  queue: {

    /**
     * The Queue API supports a variety of back-ends via an unified
     * API, giving you convenient access to each back-end using the same
     * syntax for each one. Here you may set the default queue connection.
     * @type {String}
     */
    default: 'default',

    /**
     * Here you may configure the connection information for each configuration that
     * is used by your application. A default configuration has been added.
     * You are free to add more.
     * @type {Object}
     */
    connections: {

      default: {
        options: {},
        storage: {
          driver: 'redis',
          connection: {
            host: env('REDIS_SESSION_HOST', 'localhost'),
            port: env('REDIS_SESSION_PORT', 6379),
            prefix: 'queue:'
          }
        }
      }
    }
  },

  request: {

    /**
     * Sets encoding for incoming form fields.
     * @type {String}
     */
    encoding: 'utf-8',

    /**
     * Limits the amount of memory all fields together (except files) can allocate.
     * If this value is exceeded, an 'exception' is shown. The default size is 2MB.
     * @type {String}
     */
    postMaxSize: '2MB',

    /**
     * Limits the size all uploaded files together can allocate.
     * If this value is exceeded, an 'exception' is shown. The default size is 5MB.
     * @type {String}
     */
    uploadMaxSize: '5MB'
  },

  session: {

    /**
     * Forces the session to be saved back to the session store
     * even if the session was never modified during the request
     * @type {Boolean}
     */
    resave: false,

    /**
     * Forces a session that is 'uninitialized' to be saved to the store.
     * Choosing false is useful for implementing login sessions, reducing server storage usage,
     * or complying with laws that require permission before setting a cookie.
     * Choosing false will also help with race conditions where a client
     * makes multiple parallel requests without a session.
     * @type {Boolean}
     */
    saveUninitialized: false,

    /**
     * Settings object for the session ID cookie.
     * @type {Object}
     */
    cookie: {

      /**
       * Specifies the value for the Path Set-Cookie.
       * By default, this is set to '/', which is the root path of the domain.
       * @type {String}
       */
      path: '/',

      /**
       * Specifies the boolean value for the HttpOnly Set-Cookie attribute.
       * When truthy, the HttpOnly attribute is set, otherwise it is not.
       * By default, the HttpOnly attribute is set.
       * Note be careful when setting this to true, as compliant clients will not allow
       * client-side JavaScript to see the cookie in document.cookie.
       * @type {Boolean}
       */
      httpOnly: true,

      /**
       * Specifies the boolean value for the Secure Set-Cookie attribute.
       * When truthy, the Secure attribute is set, otherwise it is not.
       * By default, the Secure attribute is not set.
       * Note be careful when setting this to true, as compliant clients will not send
       * the cookie back to the server in the future if the browser does not have an HTTPS connection.
       * @type {Boolean}
       */
      secure: false,

      /**
       * pecifies the number (in milliseconds) to use when calculating the Expires Set-Cookie attribute.
       * This is done by taking the current server time and adding maxAge milliseconds
       * to the value to calculate an Expires datetime. By default, no maximum age is set.
       * @type {Number}
       */
      maxAge: null
    },

    /**
     * The session store configuration
     * @type {Object}
     */
    store: {
      driver: 'redis',
      connection: {
        host: env('REDIS_SESSION_HOST', 'localhost'),
        port: env('REDIS_SESSION_PORT', 6379),
        prefix: env('REDIS_SESSION_PREFIX', 'app-sess-local:')
      }
    }
  },

  /**
   * Create a virtual path prefix (where the path does not actually exist in the file system)
   * for files that are served by the express.static function,
   * specify a mount path for the static directory, as shown below:
   * @type {Array}
   */
  assets: [
    { prefix: '/assets', path: 'public' },
    { prefix: '/uploads', path: 'uploads' }
  ],

  view: {

    /**
     * Controls if output with dangerous characters are escaped automatically
     * @type {Boolean}
     */
    autoescape: true,

    /**
     * Throw errors when outputting a null/undefined value
     * @type {Boolean}
     */
    throwOnUndefined: false,

    /**
     * Automatically remove trailing newlines from a block/tag
     * @type {Boolean}
     */
    trimBlocks: false,

    /**
     * Automatically remove leading whitespace from a block/tag
     * @type {Boolean}
     */
    lstripBlocks: false,

    /**
     * Never use a cache and recompile templates each time
     * @type {Boolean}
     */
    noCache: false
  },

  extensions: {}
};

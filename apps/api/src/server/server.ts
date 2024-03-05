import http from 'http';

import mysql from 'mysql2/promise';

import { Utils } from './utils.js';

declare module 'http' {
  interface IncomingMessage {
    params: Record<string, unknown>
    body: Record<string, unknown>
  }
}

export type HTTP_METHODS = 'GET' | 'POST';
export type Middleware = (req: http.IncomingMessage, res: http.ServerResponse, next?: () => void) => void;
export type Msg = string | number | object | Error;
export type ResponseBody = {
  isError: boolean
  data: Msg
  err?: Error
}

export class Server {
  #server: ReturnType<typeof http.createServer>;
  #routes: Record<HTTP_METHODS, Record<string, Middleware>> = {
    'GET': {},
    'POST': {},
  };

  constructor(readerClient: mysql.Connection, writerClient: mysql.Connection) {
    /* ======== SERVER INIT ======== */
    this.#server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
      const method = req.method!.toUpperCase() as HTTP_METHODS;

      if (method !== 'GET' && method !== 'POST') {
        return this.#sendResponse(res, 405, new Error('Method not allowed'));
      }

      const userRoute = req.url!;
      const routes = Object.keys(this.#routes[method]);
      const matchingRoute = Utils.findMatchingRoute(userRoute, routes);

      if (!matchingRoute) {
        return this.#sendResponse(res, 404, new Error(`Could not find route at ${userRoute}`));
      }

      req.params = Utils.extractRouteParams(userRoute, matchingRoute);
      // eslint-disable-next-line require-atomic-updates
      req.body = await this.#parseBody(req);

      const handler = this.#routes[method][matchingRoute];
      return handler(req, res);
    });

    /* ======== ROUTES ======== */
    this.#routes.GET['/comp4537/lab5/api/v1/query/:query'] = async (req, res) => {
      const query = decodeURI(req.params.query as string);

      try {
        const [result] = await readerClient.execute(query);
        this.#sendResponse(res, 200, result);
      } catch (e) {
        this.#sendResponse(res, 500, e as Error);
      }
    };

    this.#routes.POST['/comp4537/lab5/api/v1/query'] = async (req, res) => {
      const query = req.body.query as string;

      try {
        const [result] = await writerClient.execute(query);
        this.#sendResponse(res, 200, result);
      } catch (e) {
        this.#sendResponse(res, 500, e as Error);
      }
    };
  }

  /**
   * Parse the request body if the request is using the POST method.
   *
   * @param {http.IncomingMessage} req - The request object
   * @return {Promise<object>} The request body
   */
  #parseBody(req: http.IncomingMessage) {
    const method = req.method!.toUpperCase() as HTTP_METHODS;

    if (method !== 'POST') return Promise.resolve({});

    return new Promise<Record<string, string>>(resolve => {
      let body = '';

      req.on('data', chunk => {
        body += chunk;
      });

      req.on('end', () => {
        resolve(JSON.parse(body));
      });
    });
  }

  /**
    * Send the client a structured response.
    *
    * If sending the client an instance of an Error, the response body
    * will include an isError flag and parse the Error into an error string.
    *
    * @param {http.ServerResponse} res - The response object
    * @param {number} code - The status code of the response
    * @param {number | string | object | Error} data - The data to send to the client
    */
  #sendResponse(res: http.ServerResponse, code: number, data: Msg) {
    const isError = data instanceof Error;
    const responseBody: ResponseBody = {
      isError,
      data: isError ? data.toString() : data,
    };

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = code;
    res.write(JSON.stringify(responseBody));
    res.end();
  }

  public start(host: string, port: number, cb: () => void): void {
    this.#server.listen(port, host, cb);
  }

  public stop() {
    this.#server!.close();
  }
}

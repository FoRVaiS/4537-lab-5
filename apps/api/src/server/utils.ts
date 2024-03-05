export type SqlError = {
  message: string;
  code: string;
  errno: number;
  sql: string;
  sqlState: string;
  sqlMessage: string;
}

export const isSqlError = (err: unknown): err is SqlError => {
  const sqlErr = err as SqlError;

  const hasMessage = typeof sqlErr.message === 'string';
  const hasCode = typeof sqlErr.code === 'string';
  const hasErrno = typeof sqlErr.errno === 'number';
  const hasSql = typeof sqlErr.sql === 'string';
  const hasSqlState = typeof sqlErr.sqlState === 'string';
  const hasSqlMessage = typeof sqlErr.sqlMessage === 'string';

  return hasMessage && hasCode && hasErrno && hasSql && hasSqlState && hasSqlMessage;
};

export class Utils {
  static getDate() {
    return new Date();
  }

  /**
    * @param {string} url - A url possibly containing params
    * @param {string[]} routes - An array of routes to match against
    */
  static findMatchingRoute(url: string, routes: string[]) {
    const [path] = url.split('?');
    const pathSegments = path.split('/');

    for (const route of routes) {
      const routeSegments = route.split('/');

      // Skip routes that don't have the same number of segments
      if (routeSegments.length !== pathSegments.length) continue;

      for (const routeSegment of routeSegments) {
        const index = routeSegments.indexOf(routeSegment);
        const isLastSegment = index === routeSegments.length - 1;

        // We should ignore comparisons with params
        const isParam = routeSegment.startsWith(':');
        if (isParam && isLastSegment) return route;
        if (isParam) continue;

        // If this segment doesn't match, the entire route does not match
        const isMatchingSegment = routeSegment === pathSegments[index];
        if (!isMatchingSegment) break;

        if (isLastSegment) {
          return route;
        }
      }
    }
  }

  /**
    * @param {string} url - A url possibly containing params
    * @param {string} route - A route that defines url params from
    */
  static extractRouteParams(url: string, route: string) {
    const [path] = url.split('?');

    const pathSegments = path.split('/');
    const routeSegments = route.split('/');

    const params: Record<string, string> = {};

    for (const routeSegment of routeSegments) {
      const index = routeSegments.indexOf(routeSegment);
      const isParam = routeSegment.startsWith(':');

      if (isParam) {
        const paramName = routeSegment.slice(1);
        params[paramName] = pathSegments[index];
      }
    }

    return params;
  }

  /**
    * @param {string} url - A url possibly containing query strings
    */
  static getQueryStrings(url: string) {
    const [_, query] = url.split('?');

    const queryStrings = query
      .split('&')
      .map(queryString => queryString.split('='));

    return Object.fromEntries(queryStrings);
  }
}

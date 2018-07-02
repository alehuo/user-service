process.env.NODE_ENV = "test";
process.env.API_VERSION = "v5";

import "mocha";
import ApiRoute from "./../../src/utils/ApiRoute";
const chai: Chai.ChaiStatic = require("chai");
const should: Chai.Should = chai.should();

describe("ApiRoute", () => {
  it("Creates API route correctly, with API version and route", (done: Mocha.Done) => {
    const apiVersion: string = "v2";
    const route: string = "testroute";
    const apiUrl: string = ApiRoute.generateApiRoute(route, apiVersion);
    apiUrl.should.equal("/api/" + apiVersion + "/" + route);
    done();
  });

  it("Creates API route correctly, with API route", (done: Mocha.Done) => {
    const route: string = "testroute";
    const apiUrl: string = ApiRoute.generateApiRoute(route);
    apiUrl.should.equal("/api/" + route);
    done();
  });

  it("Middleware sets route and API version headers correctly", (done: Mocha.Done) => {
    const apiVersion: string = "v2";

    const headers: Array<{ name: string; val: string }> = [];

    let calledNext: boolean = false;

    // Mocked express
    const mockExpress: any = {
      req: {},
      res: {
        setHeader: (name: string, val: string): void => {
          headers.push({ name, val });
        }
      },
      next: (): void => {
        calledNext = true;
      }
    };

    const middleware: any = ApiRoute.apiHeaderMiddleware(apiVersion);
    // Call middleware
    middleware(mockExpress.req, mockExpress.res, mockExpress.next);

    should.exist(headers[0]);
    should.exist(headers[1]);

    headers.length.should.equal(2);
    headers[0].name.should.equal("X-Route-API-version");
    headers[0].val.should.equal(apiVersion);
    headers[1].name.should.equal("X-API-version");
    headers[1].val.should.equal(process.env.API_VERSION);
    calledNext.should.equal(true);

    done();
  });

  it("Middleware sets API version header correctly", (done: Mocha.Done) => {

    const headers: Array<{ name: string; val: string }> = [];

    let calledNext: boolean = false;

    // Mocked express
    const mockExpress: any = {
      req: {},
      res: {
        setHeader: (name: string, val: string): void => {
          headers.push({ name, val });
        }
      },
      next: (): void => {
        calledNext = true;
      }
    };

    const middleware: any = ApiRoute.apiHeaderMiddleware();
    // Call middleware
    middleware(mockExpress.req, mockExpress.res, mockExpress.next);

    should.exist(headers[0]);
    should.not.exist(headers[1]);

    headers.length.should.equal(1);
    headers[0].name.should.equal("X-API-version");
    headers[0].val.should.equal(process.env.API_VERSION);
    calledNext.should.equal(true);

    done();
  });
});

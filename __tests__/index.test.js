import request from "supertest";
import app from "../app";

const basePath = "/anki/v1";

describe(`GET ${basePath}`, () => {
  test("status code is 200", async () => {
    const response = await request(app).get(basePath);
    expect(response.statusCode).toBe(200);
  });

  test("response body has status field", async () => {
    const response = await request(app).get(basePath);
    expect(response.body.status).not.toBeUndefined();
  });
});

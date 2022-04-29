import request from "supertest";
import ankiDatabase from "../databases/ankiDatabase";
import app from "../app";

const basePath = "/anki/v1";

let pass;
let response;
let tokenCookie;

beforeAll(async () => ankiDatabase.connect(process.env.DB_TEST));

afterAll(async () => {
  await ankiDatabase.drop();
  await ankiDatabase.disconnect();
});

beforeEach(() => {
  pass = 0;
  response = undefined;
});

afterEach(() => {
  if (!pass) console.debug(response.body);
});

describe("restrictAccess.js works", () => {
  test(`GET ${basePath}/users is restricted`, async () => {
    response = await request(app)
      .get(`${basePath}/users`);
    expect(response.statusCode).toBe(401);
    pass = 1;
  });
});

describe(`POST ${basePath}/signUp`, () => {
  test("user is created", async () => {
    response = await request(app)
      .post(`${basePath}/signUp`)
      .send({
        email: "pepe@gmail.com",
        password: "1234",
        passwordAgain: "1234"
      })
      .set("Accept", "*/*");
    expect(response.body.user).not.toBeUndefined();
    pass = 1;
  });
});

describe(`POST ${basePath}/signIn`, () => {
  test("401 on bad credentials", async () => {
    response = await request(app)
      .post(`${basePath}/signIn`)
      .send({
        email: "nonsense",
        password: "nonsense"
      })
      .set("Accept", "*/*");
    expect(response.statusCode).toBe(401);
    pass = 1;
  });

  test("200 on good credentials", async () => {
    response = await request(app)
      .post(`${basePath}/signIn`)
      .send({
        email: "pepe@gmail.com",
        password: "1234"
      })
      .set("Accept", "*/*");
    expect(response.statusCode).toBe(200);
    pass = 1;
  });

  test("token cookie is created", async () => {
    response = await request(app)
      .post(`${basePath}/signIn`)
      .send({
        email: "pepe@gmail.com",
        password: "1234"
      })
      .set("Accept", "*/*");
    const cookies = response.headers["set-cookie"];
    [tokenCookie] = cookies.filter((cookie) => cookie.startsWith("token="));
    const token = tokenCookie.replace("token=", "");
    expect(token).not.toBe("");
    pass = 1;
  });
});

describe("signIn opens routes", () => {
  test(`GET ${basePath}/users is open`, async () => {
    response = await request(app)
      .get(`${basePath}/users`)
      .set("Cookie", tokenCookie);
    expect(response.statusCode).toBe(200);
    pass = 1;
  });
});

describe(`DELETE ${basePath}/signOut`, () => {
  test("token cookie is deleted", async () => {
    response = await request(app)
      .delete(`${basePath}/signOut`);
    const cookies = response.headers["set-cookie"];
    [tokenCookie] = cookies.filter((cookie) => cookie.startsWith("token="));
    const token = tokenCookie.replace("token=", "");
    expect(token).toBe("");
    pass = 1;
  });
});

import request from 'supertest';
import {createApp, RedisClient} from "./app";
import * as redis from "redis";
import {LIST_KEY} from "./app";

let app: Express.Application;
let client: RedisClient;

const REDIS_URL = "redis://default:test_env@localhost:6380"

beforeAll(async () => {
    client = redis.createClient({
        url: REDIS_URL
    })
    await client.connect();
    app = await createApp(client);
})

beforeEach(async () => {
    await client.flushDb();
})

afterAll(async () => {
    await client.flushDb();
    await client.quit();
})

describe("POST /messages", async () => {
    it("response with a success message", async() => {
        const response = await request(app)
            .post("/messages")
            .send({message: "testing with redis"});

        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("Message added to list")
    })
})

describe("GET /messages", () => {
    it("response with all messages", async () => {
        await client.lPush(LIST_KEY, ["msg1", "msg2"])
        const response = await request(app)
            .get("/messages");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(["msg2", "msg1"]);
    })
})
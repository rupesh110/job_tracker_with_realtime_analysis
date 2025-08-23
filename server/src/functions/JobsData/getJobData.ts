import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getContainer } from "../../data/config";
import { Job } from "../../models/Jobs";

export async function getJobData(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
    const container = await getContainer();
    const {resources} = await container.items.query<Job>("SELECT * FROM c").fetchAll();

    return {
        status: 200,
          headers: {
            "Content-Type": "application/json"
        },
        body:  JSON.stringify(resources)
    };
}

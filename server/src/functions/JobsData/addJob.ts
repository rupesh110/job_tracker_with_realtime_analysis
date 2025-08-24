import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getContainer } from "../../data/config";
import { Job } from "../../models/Jobs";

export async function addJob(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  const job = await req.json() as Job; 
  const container = await getContainer(); 
  await container.items.create(job);

  return {
    status: 202,
    body: "Job addeds!aaa"
  };
}

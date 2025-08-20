import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getContainer } from "../data/config";

export async function AddJob(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  const job = await req.json() as any; // bypass TypeScript for now
  const container = await getContainer(); // ensure DB/container exist
  await container.items.create(job);

  return {
    status: 201,
    body: "Job added!"
  };
}

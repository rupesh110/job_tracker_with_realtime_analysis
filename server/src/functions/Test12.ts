// src/functions/Testaaa/Test12.ts
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function Test1212(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);
    const name = request.query.get('name') || await request.text() || 'world';
    return { body: `Hello Againa, ${name}!` };
}

// Register itself immediately
app.http('Test1', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    route: "v1/test1",
    handler: Test1212
});

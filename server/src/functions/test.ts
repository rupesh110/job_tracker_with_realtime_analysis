import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function test(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    return { body: `Success` };
};

app.http('test', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: test
});

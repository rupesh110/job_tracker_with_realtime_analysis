import { app } from "@azure/functions";
import { Testing } from "./Test1212/Testing";
import { AddJob } from "./Jobs/addJob";

// Test endpoint
app.http('Test', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    route: "v2/test",
    handler: Testing
});

// Add Job endpoint
app.http('AddJob', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: "jobs/add",
    handler: AddJob
});

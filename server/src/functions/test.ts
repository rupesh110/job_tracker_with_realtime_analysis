import { app } from "@azure/functions";
import {Testing} from "./Test1212/Testing";

app.http('Test', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    route: "v2/test",
    handler: Testing
});

import { app } from "@azure/functions";
import { addJob } from "./JobsData/addJob";
import {getJobData} from "./JobsData/getJobData";

app.http('addJob', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: "v1/jobs/add",
    handler: addJob
});


app.http('allJobs', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: "v1/jobs/alljobs",
    handler: getJobData
});

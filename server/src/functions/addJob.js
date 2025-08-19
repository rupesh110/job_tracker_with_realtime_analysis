import { app } from '@azure/functions';
import { createAppliedJob } from '../data/config.js';

app.http('addjob', {
    methods: ['POST'],
    authLevel: 'function',
    handler: async (request, context) => {
        try {
            const job = await request.json();

            // Insert the applied job into Cosmos DB
            const result = await createAppliedJob(job);

            return {
                status: 200,
                body: { message: "Applied job added successfully.", item: result }
            };

        } catch (err) {
            context.log('ERROR:', err);
            return {
                status: 500,
                body: { message: "Internal Server Error", error: err.message }
            };
        }
    }
});

import { app } from '@azure/functions';
import { createUser } from '../data/config.js';

app.http('adduser', {
    methods: ['POST'],
    authLevel: 'function',
    handler: async (request, context) => {
        try {
            const job = await request.json();

            const result = await createUser(job);

            return {
                status: 200,
                body: { message: "Users added successfully.", item: result }
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

import { app } from '@azure/functions';
import { getAppliedJobsByUser } from '../data/config.js';

app.http('appliedJobs', {
    methods: ['GET'],
    authLevel: 'function',
    handler: async (request, context) => {
        try {
            // Get userId from query string
            const userId = request.query.get('userId');

            if (!userId) {
                return {
                    status: 400,
                    body: { message: "Missing userId query parameter." }
                };
            }

            const result = await getAppliedJobsByUser(userId);

            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: "Applied jobs fetched successfully.", jobs: result })
            };

        } catch (err) {
            context.log('ERROR:', err);
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: "Internal Server Error", error: err.message })
            };
        }
    }
});

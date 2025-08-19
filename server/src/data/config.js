import { CosmosClient } from "@azure/cosmos";

// Connect to Cosmos DB using environment variable
const client = new CosmosClient(process.env.CosmosDBConnection);

// Database and containers
const database = client.database("RealTimeData"); // or "appliedJobs" if you prefer
const usersContainer = database.container("Users");
const jobsContainer = database.container("AppliedJobs");

/**
 * Insert a new user
 * @param {Object} user - { userId, name, email }
 */
export async function createUser(user) {
    const { resource } = await usersContainer.items.create(user);
    return resource;
}

/**
 * Insert a new applied job
 * @param {Object} job - { appliedJobId, userId, jobTitle, status, appliedDate }
 */
export async function createAppliedJob(job) {
    const { resource } = await jobsContainer.items.create(job);
    return resource;
}

/**
 * Fetch all applied jobs for a user
 * @param {string} userId
 */
export async function getAppliedJobsByUser(userId) {
    const querySpec = {
        query: "SELECT * FROM AppliedJobs a WHERE a.userId = @userId",
        parameters: [
            { name: "@userId", value: userId }
        ]
    };

    const { resources } = await jobsContainer.items.query(querySpec).fetchAll();
    return resources;
}

export { usersContainer, jobsContainer };

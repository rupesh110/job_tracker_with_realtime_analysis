// src/functions/data/config.ts
import { CosmosClient, Container } from "@azure/cosmos";

export const endpoint = process.env.COSMOS_DB_ENDPOINT;
export const key = process.env.COSMOS_DB_KEY;
export const databaseId = process.env.COSMOS_DB_DATABASE;  // the database name
export const containerId = process.env.COSMOS_DB_CONTAINER; // the container name


export const cosmosClient = new CosmosClient({ endpoint, key });

export async function getContainer(): Promise<Container> {
  const { database } = await cosmosClient.databases.createIfNotExists({ id: databaseId });
  const { container } = await database.containers.createIfNotExists({ id: containerId });
  return container;
}

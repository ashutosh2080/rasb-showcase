import axios from "axios";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const client = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const unwrap = (response) =>
  response.data.data;

export async function getDigitalLife() {
  return unwrap(
    await client.get("/digital-life")
  );
}

export async function getPlatforms() {
  return unwrap(
    await client.get(
      "/digital-life/platforms"
    )
  );
}

export async function getPlatform(id) {
  return unwrap(
    await client.get(
      `/digital-life/platforms/${id}`
    )
  );
}

export async function createAccount(payload) {
  return unwrap(
    await client.post(
      "/digital-life/accounts",
      payload
    )
  );
}

export async function updateAccount(
  id,
  payload
) {
  return unwrap(
    await client.put(
      `/digital-life/accounts/${id}`,
      payload
    )
  );
}

export async function deleteAccount(id) {
  return client.delete(
    `/digital-life/accounts/${id}`
  );
}

export async function bulkDeleteAccounts(
  ids
) {
  return client.post(
    "/digital-life/accounts/bulk-delete",
    { ids }
  );
}

export async function createEmailAccount(
  payload
) {
  return unwrap(
    await client.post(
      "/digital-life/email-accounts",
      payload
    )
  );
}

export async function updateEmailAccount(
  id,
  payload
) {
  return unwrap(
    await client.put(
      `/digital-life/email-accounts/${id}`,
      payload
    )
  );
}

export async function deleteEmailAccount(
  id
) {
  return client.delete(
    `/digital-life/email-accounts/${id}`
  );
}

export async function createRelationship(
  payload
) {
  return unwrap(
    await client.post(
      "/digital-life/relationships",
      payload
    )
  );
}

export async function deleteRelationship(id) {
  return client.delete(
    `/digital-life/relationships/${id}`
  );
}
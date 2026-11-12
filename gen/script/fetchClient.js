let client = null;
let applications = [];

/**
 * Load one client, and the vacancies they have been put forward for, into the
 * globals above.
 *
 * Throws with the server's own sentence when the request is refused, so the
 * page can show "Client not found." rather than a generic failure.
 */
async function fetchClient(uuid) {
  const params = new URLSearchParams({ uuid });
  const response = await fetch(
    `${window.location.origin}/api/fetch/client.php?${params.toString()}`
  );

  let data = {};
  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch the client.");
  }

  client = data.client;
  applications = Array.isArray(data.applications) ? data.applications : [];
}

/** The client chosen in List Clients, from ?uuid= in the address. */
function requestedClientId() {
  return new URLSearchParams(window.location.search).get("uuid") || "";
}

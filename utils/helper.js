import { auth } from "./firebaseClient"; // Import client-side Firebase auth instance

/**
 * Helper function to get base headers including Authorization token.
 * This ensures every API call is authenticated.
 * {Promise<HeadersInit>} A promise that resolves to an object of headers.
 */
async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user found for API request.");
  }
  const idToken = await user.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${idToken}`,
  };
}

/**
 * Fetches all todo items for the authenticated user.
 * {Promise<Array<Object>>} A promise that resolves to an array of todo objects.
 */
export async function fetchTodos() {
  const headers = await getAuthHeaders();
  const response = await fetch("/api/todos", {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch todos.");
  }
  return response.json();
}

/**
 * Creates a new todo item for the authenticated user.
 * The new todo's data (e.g., { title: "New Task", completed: false }).
 * {Promise<Object>} A promise that resolves to the created todo object.
 */
export async function createTodo(todoData) {
  const headers = await getAuthHeaders();
  const response = await fetch("/api/todos", {
    method: "POST",
    headers: headers,
    body: JSON.stringify(todoData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create todo.");
  }
  return response.json();
}

/**
 * Updates an existing todo item for the authenticated user.
 * {string} id - The ID of the todo to update.
 * {Object} updateData - The data to update (e.g., { title: "Updated Task", completed: true }).
 * {Promise<Object>} A promise that resolves to the updated todo object or success message.
 */
export async function updateTodo(id, updateData) {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/todos/${id}`, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update todo.");
  }
  return response.json();
}

/**
 * Deletes a todo item for the authenticated user.
 * {string} id - The ID of the todo to delete.
 * {Promise<void>} A promise that resolves when the todo is deleted.
 */
export async function deleteTodo(id) {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/todos/${id}`, {
    method: "DELETE",
    headers: headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete todo.");
  }
  // For 204 No Content, response.json() would throw an error, so handle it.
  if (response.status === 204) {
    return; // Successfully deleted, no content
  }
  return response.json(); // If API sends success message with content
}


/**
 * Fetches a single todo item by ID for the authenticated user.
 * {string} id - The ID of the todo to fetch.
 * {Promise<Object>} A promise that resolves to the todo object.
 */
export async function fetchTodo(id) {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/todos/${id}`, {
    method: 'GET',
    headers: headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch todo.');
  }
  return response.json();
}


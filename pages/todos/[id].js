import React, { useState, useEffect } from "react";

// Use useRouter from 'next/router' for Pages Router
import { useRouter } from "next/router";

// Import our API helper function to fetch a single todo
import { fetchTodo } from "../../utils/helper"; 

import { useAuth } from "../../contexts/AuthContext"; 

export default function TodoDetailsPage() {
  const router = useRouter();
  const { user } = useAuth(); // Get authenticated user context

  // For Pages Router, dynamic parameters are accessed via router.query
  const { id } = router.query;

  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTodoDetails = async () => {
      // Ensure user is logged in before fetching data
      // This is a client-side redirect. Server-side checks are also important in API.
      if (!user) {
        router.push("/"); // Redirect to home/login page if no user
        return;
      }

      // Ensure ID is available from router.query
      if (!id) {
        setLoading(false); // No ID, so stop loading
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Use the fetchTodo function from our API utility
        const fetchedTodo = await fetchTodo(id);
        setTodo(fetchedTodo);
      } catch (err) {
        setError(`Failed to load todo details: ${err.message || "Unknown error"}`);
        console.error("Error loading todo details:", err);
      } finally {
        setLoading(false);
      }
    };

    // Only run if user is logged in and ID is available
    if (user && id) {
      loadTodoDetails();
    } else if (!user) {
      // If user logs out while on this page, immediately redirect
      router.push("/");
    }
  }, [id, user, router]); // Re-fetch if ID or user changes, or router (though router rarely changes)

  const handleBackToList = () => {
    router.push("/"); // Navigate back to the main todo list
  };

  // --- Conditional Rendering ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700">
        Loading todo details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-100 text-red-700 p-4">
        <p className="mb-4">{error}</p>
        <button
          onClick={handleBackToList}
          className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
        >
          Back to List
        </button>
      </div>
    );
  }

  // If todo is null (e.g., ID was in URL but todo not found)
  if (!todo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-700 p-4">
        <p className="mb-4">Todo item not found or you do not have access.</p>
        <button
          onClick={handleBackToList}
          className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white p-6 sm:p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 text-center">
          Todo Details
        </h1>

        <div className="space-y-4 text-lg">
          <p>
            <strong className="text-gray-700">ID:</strong>{" "}
            <span className="text-gray-600 break-all">{todo.id}</span>
          </p>
          <p>
            <strong className="text-gray-700">Title:</strong>{" "}
            <span className="text-gray-800">{todo.title}</span> {/* Changed from todo.text */}
          </p>
          <p>
            <strong className="text-gray-700">Completed:</strong>{" "}
            <span
              className={`font-semibold ${todo.completed ? "text-green-600" : "text-yellow-600"}`}
            >
              {todo.completed ? "Yes" : "No"}
            </span>
          </p>
          {/* Check for existence before rendering, and correct property names */}
          {todo.priority && (
            <p>
              <strong className="text-gray-700">Priority:</strong>{" "}
              <span className="text-gray-600">{todo.priority}</span>
            </p>
          )}
          {todo.dueDate && (
            <p>
              <strong className="text-gray-700">Due Date:</strong>{" "}
              {/* Ensure dueDate is a valid date string/timestamp from Firestore */}
              <span className="text-gray-600">
                {new Date(todo.dueDate.seconds * 1000).toLocaleDateString()}
              </span>
            </p>
          )}
          {todo.createdAt && (
            <p>
              <strong className="text-gray-700">Created At:</strong>{" "}
              {/* Firestore Timestamps have seconds and nanoseconds, convert to JS Date */}
              <span className="text-gray-600">
                {new Date(todo.createdAt.seconds * 1000).toLocaleString()}
              </span>
            </p>
          )}
          {todo.updatedAt && (
            <p>
              <strong className="text-gray-700">Last Updated:</strong>{" "}
              <span className="text-gray-600">
                {new Date(todo.updatedAt.seconds * 1000).toLocaleString()}
              </span>
            </p>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleBackToList}
            className="px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 text-sm sm:text-base"
          >
            Back to All Todos
          </button>
        </div>
      </div>
    </div>
  );
}

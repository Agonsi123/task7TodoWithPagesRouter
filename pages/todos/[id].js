import React, { useState, useEffect } from "react";
// Use useRouter from 'next/router' for Pages Router
import { useRouter } from "next/router";
// Import our API helper function to fetch a single todo
import { fetchTodo } from "../../utils/helper"; 
import { useAuth } from "../../contexts/AuthContext";
// Import the dynamic API route handler directly
import { default as todoDetailsApiHandler } from '../api/todos/[id]';



export async function getServerSideProps(context) {
  const { id } = context.params; // Get the ID from the URL (server-side)

  let initialTodo = null;

  try {
    // Simulating the API call to your /api/todos/[id] handler
    const apiReq = {
      method: 'GET',
      headers: {
        // If you had an authenticated session cookie, pass it here.
        // 'cookie': context.req.headers.cookie || '',
      },
      query: { id: id }, // Pass the dynamic ID to the API handler's req.query
    };
    const apiRes = {
      statusCode: 200,
      jsonData: null,
      status: function(statusCode) { this.statusCode = statusCode; return this; },
      json: function(data) { this.jsonData = data; return this; },
      end: function() { return this; },
      setHeader: function() { return this; },
    };

    await todoDetailsApiHandler(apiReq, apiRes);

    if (apiRes.statusCode === 200) {
      initialTodo = apiRes.jsonData;
    } else if (apiRes.statusCode === 404) {
      console.warn(`SSR: Todo with ID ${id} not found.`);
    } else {
      console.warn(`SSR: Fetching todo ${id} failed with status ${apiRes.statusCode}:`, apiRes.jsonData?.error);
    }

  } catch (error) {
    console.error(`Error fetching todo ${id} in getServerSideProps:`, error);
  }

  // Pass the fetched todo as props to the TodoDetailsPage component
  return {
    props: {
      initialTodo,
    },
  };
}


export default function TodoDetailsPage({ initialTodo }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Get authenticated user context

  // For Pages Router, dynamic parameters are accessed via router.query
  //   const { id } = router.query;

  const [todo, setTodo] = useState(initialTodo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If SSR didn't find the todo, or user isn't authenticated, or it's a client-side navigation
    if (!authLoading && user && !todo && router.isReady && router.query.id) {
      const loadClientSideTodoDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const fetchedTodo = await fetchTodo(router.query.id);
          setTodo(fetchedTodo);
        } catch (err) {
          setError(`Failed to load todo details: ${err.message || "Unknown error"}`);
          console.error("Error loading todo details client-side:", err);
        } finally {
          setLoading(false);
        }
      };
      loadClientSideTodoDetails();
    } else if (!authLoading && !user && router.isReady && router.query.id) {
      // If no user and auth is not loading, redirect if user arrived here unauthenticated
      router.push("/");
    }
  }, [initialTodo, user, authLoading, router, todo, router.query.id]);

  const handleBackToList = () => {
    router.push("/"); // Navigate back to the main todo list
  };

  // --- Conditional Rendering combine with client-side fetch loading---
  if (authLoading || loading) {
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

  // If todo is null (e.g., ID was in URL but todo not found, even after client-side fetch)
  // Or if user is no longer logged in (after hydration))
  if (!todo || !user) {
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

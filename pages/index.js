import { useAuth } from "@/contexts/AuthContext";
import AuthForm from "./components/AuthForm";
import TodoApp from "./components/TodoApp";
import { default as todosApiHandler } from "./api/todos/index";

export async function getServerSideProps(context) {
  let initialTodos = [];

  try {
    const apiReq = {
      method: "GET",
      headets: {},
    };
    const apiRes = {
      statusCode: 200, // Default to 200, handler will change if error/unauthorized
      jsonData: null,
      status: function (statusCode) {
        this.statusCode = statusCode;
        return this;
      },
      json: function (data) {
        this.jsonData = data;
        return this;
      },
      end: function () {
        return this;
      },
      setHeader: function () {
        return this;
      },
    };

    // Call the API handler directly (server-to-server communication)
    await todosApiHandler(apiReq, apiRes);

    if (apiRes.statusCode === 200) {
      initialTodos = apiRes.jsonData;
    } else {
      console.warn(
        `SSR for /api/todos failed with status ${apiRes.statusCode}:`,
        apiRes.jsonData?.error
      );
      initialTodos = []; // Ensure empty array if unauthorized or error
    }
  } catch (error) {
    console.error("Error fetching todos in getServerSideProps:", error);
    initialTodos = [];
  }

  // Pass the fetched todos as props to the HomePage component
  return {
    props: {
      initialTodos,
    },
  };
}

export default function Home({ initialTodos }) {
  //Accept initialTodos PROP HERE
  const { user, loading } = useAuth(); //AuthContext handles client-side user state

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Checking authentication status...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  // If user is logged in, show the main todo application content
  return <TodoApp initialTodos={initialTodos} />;
}

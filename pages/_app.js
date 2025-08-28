import "@/styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext"; // Path to my AuthProvider
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Todo App built with Pages Router</title>
      </Head>
      {/* Wrap the entire application with AuthProvider */}
      <AuthProvider>
        {/* Component represents the current page being rendered */}
        <Component {...pageProps} />
      </AuthProvider>
    </>
  );
}


// import admin, db and auth from firebaseAdmin.js
const { admin, db, auth } = require('@/utils/firebaseAdmin'); 

export default async function handler(req, res) {
  // --- Common Authentication Logic ---
  let userId = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const idToken = authHeader.split("Bearer ")[1];
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      userId = decodedToken.uid;
    } catch (error) {
      console.warn("API Auth Error: Invalid or expired ID token:", error);
      return res.status(401).json({ error: "Unauthorized: Invalid or expired token." });
    }
  } else {
    return res.status(401).json({ error: "Unauthorized: No authentication token provided." });
  }
  // --- End Common Authentication Logic ---

  if (req.method === "GET") {
    // --- Fetch All Todos for the Authenticated User ---
    try {
      let query = db.collection("todos").where("userId", "==", userId);

      // Order by creation time, newest first
      query = query.orderBy("createdAt", "desc");

      const todosSnapshot = await query.get();

      const todos = todosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json(todos);
    } catch (error) {
      console.error("Error fetching todos:", error);
      res.status(500).json({ error: "Failed to fetch todos. Please try again later." });
    }
  } else if (req.method === "POST") {
    // --- Add a New Todo for the Authenticated User ---
    try {
      const { title, completed } = req.body;

      if (!title || typeof title !== "string" || title.trim() === "") {
        return res
          .status(400)
          .json({ error: "Todo title is required and must be a non-empty string." });
      }

      // Ensure completed is a boolean, default to false if not provided or invalid
      const isCompleted = typeof completed === "boolean" ? completed : false;

      const newTodoData = {
        title: title.trim(),
        completed: isCompleted,
        userId: userId, // Associate with the authenticated user
        createdAt: admin.firestore.FieldValue.serverTimestamp(), // Use server timestamp
      };

      const docRef = await db.collection("todos").add(newTodoData);

      // Return the newly created todo with its ID
      res.status(201).json({ id: docRef.id, ...newTodoData });
    } catch (error) {
      console.error("Error adding todo:", error);
      res.status(500).json({ error: "Failed to add todo. Please try again later." });
    }
  } else {
    // --- Handle Unsupported Methods ---
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

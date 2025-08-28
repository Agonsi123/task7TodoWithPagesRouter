// Import admin, db, and auth from firebaseAdmin.js
const { admin, db, auth } = require("@/utils/firebaseAdmin"); 

export default async function handler(req, res) {
  const { id } = req.query;

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

  const todoRef = db.collection("todos").doc(id);

  if (req.method === "GET") {
    try {
      const todoDoc = await todoRef.get();
      if (!todoDoc.exists) {
        return res.status(404).json({ error: "Todo not found." });
      }
      if (todoDoc.data().userId !== userId) {
        return res
          .status(403)
          .json({ error: "Forbidden: You do not have permission to access this todo." });
      }
      res.status(200).json({ id: todoDoc.id, ...todoDoc.data() });
    } catch (error) {
      console.error(`Error fetching todo ${id}:`, error);
      res.status(500).json({ error: "Failed to fetch todo. Please try again later." });
    }
  } else if (req.method === "PUT") {
    try {
      const { title, completed } = req.body;
      if (title === undefined && completed === undefined) {
        return res
          .status(400)
          .json({ error: 'No update data provided. Requires "title" or "completed".' });
      }

      const todoDoc = await todoRef.get();
      if (!todoDoc.exists) {
        return res.status(404).json({ error: "Todo not found." });
      }
      if (todoDoc.data().userId !== userId) {
        return res
          .status(403)
          .json({ error: "Forbidden: You do not have permission to update this todo." });
      }

      const updateData = {};
      if (title !== undefined) {
        if (typeof title !== "string" || title.trim() === "") {
          return res.status(400).json({ error: "Title must be a non-empty string." });
        }
        updateData.title = title.trim();
      }
      if (completed !== undefined) {
        if (typeof completed !== "boolean") {
          return res.status(400).json({ error: "Completed must be a boolean." });
        }
        updateData.completed = completed;
      }
      updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

      await todoRef.update(updateData);
      res.status(200).json({ message: "Todo updated successfully.", id: id, ...updateData });
    } catch (error) {
      console.error(`Error updating todo ${id}:`, error);
      res.status(500).json({ error: "Failed to update todo. Please try again later." });
    }
  } else if (req.method === "DELETE") {
    try {
      const todoDoc = await todoRef.get();
      if (!todoDoc.exists) {
        return res.status(404).json({ error: "Todo not found." });
      }
      if (todoDoc.data().userId !== userId) {
        return res
          .status(403)
          .json({ error: "Forbidden: You do not have permission to delete this todo." });
      }

      await todoRef.delete();
      res.status(204).end();
    } catch (error) {
      console.error(`Error deleting todo ${id}:`, error);
      res.status(500).json({ error: "Failed to delete todo. Please try again later." });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

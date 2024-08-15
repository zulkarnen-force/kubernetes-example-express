const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Create a new user
app.post("/user", async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await prisma.user.create({
      data: { name, email },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "User creation failed." });
  }
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// Get a user by ID
app.get("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user." });
  }
});

// Update a user
app.put("/user/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, email },
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "User update failed." });
  }
});

// Delete a user
app.delete("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "User deletion failed." });
  }
});

// Get a user by email
app.get("/user/email/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user." });
  }
});

// Get all users with pagination
app.get("/users/page/:page", async (req, res) => {
  const page = parseInt(req.params.page) || 1;
  const pageSize = 10; // Adjust page size as needed
  const skip = (page - 1) * pageSize;
  try {
    const users = await prisma.user.findMany({
      skip,
      take: pageSize,
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// Get all users with filtering by name
app.get("/users/search", async (req, res) => {
  const { name } = req.query;
  try {
    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: name,
          mode: "insensitive",
        },
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// Health check endpoint
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

// Readiness check endpoint
app.get("/readyz", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`; // Simple query to check database connection
    res.status(200).send("OK");
  } catch (error) {
    res.status(500).send("Not Ready");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

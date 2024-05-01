const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const port = 3000;
const Password = require("./models/password.js");

mongoose
  .connect("mongodb://localhost:27017/passforge")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error", err));

app.use(
  cors({
    origin: "http://localhost:4200",
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/add/:email", async (req, res) => {
  try {
    const password = new Password({
      ...req.body,
      userEmail: req.params.email, 
    });
    console.log(password)
    await password.save();
    res.status(201).send(password);
  } catch (error) {
    console.log(error)
    res.status(400).send(error);
  }
});


app.get("/fetch", async (req, res) => {
  try {
     const userEmail = req.query.email;
     const passwords = await Password.find({ userEmail: userEmail });
    res.send(passwords);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete("/delete/:id/:email", async (req, res) => {
  try {
    const password = await Password.findById(req.params.id);
    if (!password) {
      return res.status(404).send({ message: "Password not found" });
    }

    const userEmail = req.params.email;     

    if (password.userEmail !== userEmail) {
      return res
        .status(403)
        .send({ message: "Unauthorized to delete this password" });
    }

    await Password.findByIdAndDelete(req.params.id);
    res.send({ message: "Password deleted" });
  } catch (error) {
    res.status(500).send(error);
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

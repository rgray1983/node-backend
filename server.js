require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const formSchema = new mongoose.Schema({
    field1: String,
    field2: String,
    field3: String
});

const Form = mongoose.model("Form", formSchema);

app.post("/forms", async (req, res) => {
    const newForm = new Form(req.body);
    await newForm.save();
    res.status(201).json(newForm);
});

app.get("/forms", async (req, res) => {
    const forms = await Form.find();
    res.json(forms);
});

app.put("/forms/:id", async (req, res) => {
    const updatedForm = await Form.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedForm);
});

app.delete("/forms/:id", async (req, res) => {
    await Form.findByIdAndDelete(req.params.id);
    res.json({ message: "Form deleted" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

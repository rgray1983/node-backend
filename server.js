require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Schema with Auto-Incremented Form Number
const formSchema = new mongoose.Schema({
    formNumber: { type: Number, unique: true },  // Unique form number
    field1: String,
    field2: String,
    field3: String
});

// Auto-increment formNumber
formSchema.pre("save", async function (next) {
    if (!this.formNumber) {
        const lastForm = await Form.findOne().sort({ formNumber: -1 });
        this.formNumber = lastForm ? lastForm.formNumber + 1 : 11783;  // Start from 11783
    }
    next();
});

const Form = mongoose.model("Form", formSchema);

// Save New Form
app.post("/forms", async (req, res) => {
    try {
        const newForm = new Form(req.body);
        await newForm.save();
        res.status(201).json(newForm);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error saving form" });
    }
});

// Get All Forms (Latest 10)
app.get("/forms", async (req, res) => {
    try {
        const forms = await Form.find().sort({ formNumber: -1 }).limit(10);
        res.json(forms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching forms" });
    }
});

// Search Forms
app.get("/forms/search", async (req, res) => {
    try {
        const searchTerm = req.query.q || "";
        const forms = await Form.find({
            $or: [
                { field1: { $regex: searchTerm, $options: "i" } },
                { field2: { $regex: searchTerm, $options: "i" } },
                { field3: { $regex: searchTerm, $options: "i" } }
            ]
        }).sort({ formNumber: -1 }).limit(10);
        res.json(forms);
    } catch (error) {
        console.error("Error searching forms:", error);
        res.status(500).json({ error: "Server Error" });
    }
});

// Update Form
app.put("/forms/:id", async (req, res) => {
    try {
        const updatedForm = await Form.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedForm) return res.status(404).json({ error: "Form not found" });
        res.json({ message: "Form updated successfully", form: updatedForm });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update form" });
    }
});

// Delete Form
app.delete("/forms/:id", async (req, res) => {
    try {
        const deletedForm = await Form.findByIdAndDelete(req.params.id);
        if (!deletedForm) return res.status(404).json({ error: "Form not found" });
        res.json({ message: "Form deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete form" });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

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

// Define form schema with an auto-incrementing 'formNumber' field
const formSchema = new mongoose.Schema({
    formNumber: { type: Number, unique: true },
    field1: String,
    field2: String,
    field3: String
});

// Pre-save hook to automatically generate a new sequential form number
formSchema.pre('save', async function(next) {
    if (!this.formNumber) {  // Only generate a new number if it's not set
        const lastForm = await Form.findOne().sort({ formNumber: -1 }).exec();
        this.formNumber = lastForm ? lastForm.formNumber + 1 : 1;
    }
    next();
});

const Form = mongoose.model("Form", formSchema);

app.post("/forms", async (req, res) => {
    const newForm = new Form(req.body);
    await newForm.save();
    res.status(201).json(newForm);
});

app.get("/forms", async (req, res) => {
    // Ensure to get all forms, sorted by formNumber descending, and limit to 5
    const forms = await Form.find().sort({ formNumber: -1 }).limit(5);  // Fetch latest 5 forms
    res.json(forms);
});

app.put("/forms/:id", async (req, res) => {
    const { id } = req.params;
    const { field1, field2, field3 } = req.body;

    try {
        const updatedForm = await Form.findByIdAndUpdate(id, { field1, field2, field3 }, { new: true });
        if (!updatedForm) {
            return res.status(404).json({ error: "Form not found" });
        }
        res.json({ message: "Form updated successfully", form: updatedForm });
    } catch (error) {
        res.status(500).json({ error: "Failed to update form" });
    }
});

app.delete("/forms/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
        const deletedForm = await Form.findByIdAndDelete(id);
        if (!deletedForm) {
            return res.status(404).json({ error: "Form not found" });
        }
        res.json({ message: "Form deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete form" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

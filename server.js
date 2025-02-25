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

import express from "express";
import cors from "cors";
import projectsRouter from "./routes/projects";
import skillsRouter from "./routes/skills";
import contactRouter from "./routes/contact";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/projects", projectsRouter);
app.use("/api/skills", skillsRouter);
app.use("/api/contact", contactRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT);

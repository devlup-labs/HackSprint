import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './db/database.js'
import hackathonRoutes from './routes/hackathon.routes.js'
import userRoutes from './routes/user.routes.js'
import oauthRoutes from './routes/googleAuth.routes.js'
import authRoutes from "./routes/auth.route.js"
import devquestRoutes from './routes/devquest.routes.js'
import githubRoutes from "./routes/githubAuth.routes.js";
import dailyQuizRoutes from "./routes/dailyQuiz.routes.js";
import registrationRoutes from "./routes/registration.routes.js";
import submitRoutes from "./routes/submission.routes.js";
import "./controllers/dailyQuiz.js";
import teamRoutes from './routes/team.routes.js'
import { githubDataRoutes } from './routes/githubData.routes.js'

const app = express()
dotenv.config()
connectDB()

app.use(express.json())
app.use(cors(
    {
        origin: '*'
    }
))

app.use("/api/githubData", githubDataRoutes)
app.use("/api/devquest", devquestRoutes)
app.use("/api/hackathons", hackathonRoutes)
app.use("/api/user",userRoutes)
app.use("/api/dailyquiz", dailyQuizRoutes);
app.use("/api/register" , registrationRoutes);
app.use("/api/submit" , submitRoutes);
app.use("/api", githubRoutes)
app.use("/api", oauthRoutes)
app.use("/api/account", authRoutes)
app.use("/api/team", teamRoutes);

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on ${PORT}`))

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import adminRouter from './routes/adminRoutes.js';
import blogRouter from './routes/blogRoutes.js';


const app = express();

 await connectDB()
// Middlewarea
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://ai-powered-blogging-platform-rouge.vercel.app");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ai-powered-blogging-platform-rouge.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(express.json())
//Routes
app.get('/',(req,res)=> res.send("API is Working v2"))
app.use('/api/admin', adminRouter)
app.use('/api/blog', blogRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
  console.log('Server is running on port ' + PORT)
  
})

export default app;

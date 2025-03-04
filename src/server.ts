import express from 'express' 
import morgan from 'morgan'
import { db } from './config/db'
import budgetRouter from './routes/budgetRouter'
import authRouter from './routes/authRouter'


async function connectDB () {
    try {
        await db.authenticate()
        db.sync()
        console.log('Conectado a la base de datos'.green)
    } catch (error) {
        console.log('Error al conectar a la base de datos'.red)
        // console.log(error)
    }
}
connectDB()

const app = express()
app.use(morgan('dev'))
app.use(express.json())

// app

app.use("/api/budgets", budgetRouter)
app.use("/api/auth", authRouter)


export default app
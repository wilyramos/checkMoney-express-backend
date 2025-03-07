import { db } from '../config/db'
import { exit } from 'node:process'
import 'colors'

const clearData = async () => {

    try {
        await db.sync({ force: true })
        console.log('Base de datos eliminada'.green)
        exit(0)
    } catch (error) {
        console.log('Error al conectar a la base de datos'.red)
        // console.log(error)
        exit(1)
    }
    
}

if (process.argv[2] === '--clear') {
    clearData()
}

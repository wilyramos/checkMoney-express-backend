import request from 'supertest';
import server, { connectDB } from '../../server';
import { AuthController } from '../../controllers/AuthController';


describe('Authtentication - Create Account', () => {

    it('Should display validation errors when form is empty', async () => {
        const response = await request(server)
                            .post('/api/auth/create-account')
                            .send({})

        const createAccountMock = jest.spyOn(AuthController, 'createAccount')
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(3)

        expect(response.status).not.toBe(201)
        expect(response.body.errors).not.toHaveLength(2)
        expect(createAccountMock).not.toHaveBeenCalled()
    })

    it('Should return 400 when email is invalid', async () => {
        const response = await request(server)
                            .post('/api/auth/create-account')
                            .send({ name: 'test', email: 'not_valid_email', password: 'testpassword' })

        const createAccountMock = jest.spyOn(AuthController, 'createAccount')

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)

        expect(response.body.errors[0].msg).toBe('Email is not valid')

        expect(response.status).not.toBe(201)
        expect(response.body.errors).not.toHaveLength(2)
        expect(createAccountMock).not.toHaveBeenCalled()
    })

    it('Should return 400 when password is less than 6 characters', async () => {
        const response = await request(server)
                            .post('/api/auth/create-account')
                            .send({ name: 'test', email: 'test@test.com', password: 'test' })
        
        const createAccountMock = jest.spyOn(AuthController, 'createAccount')

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')

        expect(response.body.errors[0].msg).toBe('Password must be at least 6 characters')

        expect(response.status).not.toBe(201)
        expect(response.body.errors).not.toHaveLength(2)
        expect(createAccountMock).not.toHaveBeenCalled()
    })

    it('Should return 201 when account is created', async () => {

        const userData = {
            name: 'test',
            email: 'test@test.com',
            password: 'testpassword'
        }
        const response = await request(server)
                            .post('/api/auth/create-account')
                            .send(userData)
        
        const createAccountMock = jest.spyOn(AuthController, 'createAccount')

        expect(response.status).toBe(201)
        

    })
})
import request from 'supertest';
import server from '../../server';
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

    it('Should register a new user succesfully', async () => {

        const userData = {
            name: 'test',
            email: 'test@test.com',
            password: 'password'
        }
        const response = await request(server)
                            .post('/api/auth/create-account')
                            .send(userData)
        
        expect(response.status).toBe(201);
        expect(response.status).not.toBe(400);
        expect(response.body).not.toHaveProperty('errors')
    })

    it('Should return 409 when email is already in use', async () => {
        const userData = {
            name: 'test',
            email: 'test@test.com',
            password: 'password'
        }
        const response = await request(server)
                            .post('/api/auth/create-account')
                            .send(userData)

        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Email already in use')
        expect(response.status).not.toBe(201);
        expect(response.status).not.toBe(400);
    })  
})

describe('Authtentication - Confirm Account', () => {

    it('Should display validation errors when token is empty or otken is not valid', async () => {

        const response = await request(server)
                            .post('/api/auth/confirm-account')
                            .send({
                                token: 'not_valid'
                            })

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('Invalid token')
    })

    it('Should display error when token is not found', async () => {
        
        const response = await request(server)
                            .post('/api/auth/confirm-account')
                            .send({
                                token: "123456"
                            })
        expect(response.status).toBe(401)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Invalid token')
        expect(response.status).not.toBe(200)
    })

    it('Should confirm account successfully', async () => {

        const token = globalThis.cashTrackerConfirmationToken
        const response = await request(server)
                            .post('/api/auth/confirm-account')
                            .send({ token })
        expect(response.status).toBe(200)
        expect(response.body).toEqual('Account confirmed')
        expect(response.status).not.toBe(401)
    })
})
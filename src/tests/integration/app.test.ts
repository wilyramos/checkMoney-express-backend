import request from 'supertest'
import server from '../../server'
import { AuthController } from '../../controllers/AuthController'
import User from '../../models/User'
import * as authUtils from '../../utils/auth'
import * as jwtUtils from '../../utils/jwt'

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

describe('Authtentication - Login', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('Should display validation errors when form is empty', async () => {

        const response = await request(server)
                            .post('/api/auth/login')
                            .send({})

        const loginMock = jest.spyOn(AuthController, 'login')
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(2)

        expect(response.body.errors).not.toHaveLength(1)
        expect(loginMock).not.toHaveBeenCalled()
    })

    it('Should return 400 bad request when the email is invalid', async () => {
        
        const response = await request(server)
                            .post('/api/auth/login')
                            .send({ email: 'not_valid', password: 'password' })

        const loginMock = jest.spyOn(AuthController, 'login')
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('Email is not valid')
        expect(loginMock).not.toHaveBeenCalled()
    }) 

    it('Should return 404 when user is not found', async () => {
        
        const response = await request(server)
                            .post('/api/auth/login')
                            .send({ email: 'user_not_found@test.com', password: 'password' })

        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('User not found')
    })

    // Form 1 - User is not confirmed
    it('Should return 403 when account is not confirmed', async () => {

        (jest.spyOn(User, 'findOne') as jest.Mock).mockResolvedValue({
            id: 1,
            confirmed: false,
            password: 'hashed_password',
            email: "user_not_confirmed@test.com"
        })
        
        const response = await request(server)
                            .post('/api/auth/login')
                            .send({ email: 'user_not_confirmed@test.com', password: 'password' })

        expect(response.status).toBe(403)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Account not confirmed')  
    })

    // Form 2 - User is not confirmed

    it('Should return 403 when account is not confirmed', async () => {

        const userData = {
            name: 'test',
            email: "user_not_confirmend@test.com",
            password: 'password'
        }

        await request(server)
                    .post('/api/auth/create-account')
                    .send(userData)
        
        const response = await request(server)
                            .post('/api/auth/login')
                            .send({ 
                                "email" : userData.email,
                                "password" : userData.password
                             })

        expect(response.status).toBe(403)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Account not confirmed')  
    })

    it('Should return 401 when password is invalid', async () => {

        const finOne = (jest.spyOn(User, 'findOne') as jest.Mock).mockResolvedValue({
            id: 1,
            confirmed: true,
            password: 'hashed_password',
            email: "test@test.com"
        })

        const checkPassword = jest.spyOn(authUtils, 'comparePassword').mockResolvedValue(false)
        
        const response = await request(server)
                            .post('/api/auth/login')
                            .send({ email: 'test@test.com', password: 'invalid_password' })
        
        expect(response.status).toBe(401)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Invalid password')

        expect(checkPassword).toHaveBeenCalledTimes(1)
        expect(finOne).toHaveBeenCalledTimes(1) 
    })

    it('Should return 200 when login is successful', async () => {
        
        const findOne = (jest.spyOn(User, 'findOne') as jest.Mock).mockResolvedValue({
            id: 1,
            confirmed: true,
            password: 'hashed_password',
            email: "test@test.com"
        })

        const comparePassword = jest.spyOn(authUtils, 'comparePassword').mockResolvedValue(true)
        const generateJWT = jest.spyOn(jwtUtils, 'generateJWT').mockReturnValue('jwt_token')

        const response = await request(server)
                            .post('/api/auth/login')
                            .send({ email: 'test@test.com', password: 'password' })
        
        expect(response.status).toBe(200)
        expect(response.body).toEqual('jwt_token')

        expect(findOne).toHaveBeenCalledTimes(1)

        expect(comparePassword).toHaveBeenCalledTimes(1)
        expect(comparePassword).toHaveBeenCalledWith('password', 'hashed_password')
        expect(generateJWT).toHaveBeenCalledTimes(1)

        expect(generateJWT).toHaveBeenCalled()
        expect(generateJWT).toHaveBeenCalledWith(1)

    })
})


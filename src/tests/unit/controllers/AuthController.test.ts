import { createRequest, createResponse } from "node-mocks-http"
import { AuthController } from "../../../controllers/AuthController"
import User from "../../../models/User"
import { comparePassword, hashPassword } from "../../../utils/auth"
import { generateToken } from "../../../utils/token"
import { AuthEmail } from "../../../emails/AuthEmail"
import { generateJWT } from "../../../utils/jwt"

jest.mock('../../../models/User')
jest.mock('../../../utils/auth')
jest.mock('../../../utils/token')
jest.mock('../../../utils/jwt')


describe('AuthController.createAccount', () => {

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should return an error if the email is already in use', async () => {
        
        (User.findOne as jest.Mock).mockResolvedValue(true)
    
        const req = createRequest({
            method: 'POST',
            url: '/api/auth/create-account',
            body: { email: "test@test.com", password: "testpassword" }
        })
        const res = createResponse();
        
        await AuthController.createAccount(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(409)
        expect(data.error).toBe('Email already in use')
        expect(User.findOne).toHaveBeenCalled()
        expect(User.findOne).toHaveBeenCalledTimes(1)
    })

    it('should create an account and send a confirmation email', async () => {
        
        // (User.findOne as jest.Mock).mockResolvedValue(false)
        
        const req = createRequest({
            method: 'POST',
            url: '/api/auth/create-account',
            body: { email: "test@test.com", password: "testpassword" }
        })
        const res = createResponse();

        const mockUser = { ...req.body, save: jest.fn() };
        (User.create as jest.Mock).mockResolvedValue(mockUser); // async function
        (hashPassword as jest.Mock).mockReturnValue('hashedpassword');
        (generateToken as jest.Mock).mockReturnValue('testtoken');
        jest.spyOn(AuthEmail, "sendConfirmationEmail").mockImplementation(() => Promise.resolve());

        await AuthController.createAccount(req, res)

        expect(User.create).toHaveBeenCalledWith(req.body)
        expect(User.create).toHaveBeenCalledTimes(1)
        expect(mockUser.save).toHaveBeenCalled()
        expect(mockUser.password).toBe('hashedpassword')
        expect(mockUser.token).toBe('testtoken')
        expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledWith({
            name: req.body.name,
            email: req.body.email,
            token: 'testtoken'
        })
        expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledTimes(1)
        expect(res.statusCode).toBe(201)
    })
})

describe('AuthController.login', () => {
    it('should return an error if the user is not found', async () => {

        (User.findOne as jest.Mock).mockResolvedValue(false)

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: { email: "tes@test.com", password: "testpassword" }
        })
        const res = createResponse();

        await AuthController.login(req, res)
        const data = res._getJSONData()
        expect(res.statusCode).toBe(404)
        expect(data.error).toBe('User not found')
        expect(User.findOne).toHaveBeenCalled()
    })

    it('should return 403 if the account has not been confirmed', async () => {

        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1, 
            email: "test@test.com", 
            password: "testpassword", 
            confirmed: false
        })

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: { email: "tes@test.com", password: "testpassword" }
        })
        const res = createResponse();

        await AuthController.login(req, res)
        const data = res._getJSONData()
        // console.log(data)
        expect(res.statusCode).toBe(403)
        expect(data.error).toBe('Account not confirmed')        
    })

    it('Should return 401 if the password is incorrect', async () => {

        const userMock = {
            id: 1, 
            email: "test@test.com",
            password: "testpassword",
            confirmed: true
        };
        
        (User.findOne as jest.Mock).mockResolvedValue(userMock)

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: { email: "test@test.com", password: "wrongpassword" }
        })

        const res = createResponse();

        ( comparePassword as jest.Mock).mockResolvedValue(false)
        await AuthController.login(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(401)
        expect(data.error).toBe('Invalid password')
        expect(comparePassword).toHaveBeenCalledWith(req.body.password, userMock.password)
    })

    it('Should return a JWT if authentication is successful', async () => {
        const userMock = {
            id: 1, 
            email: "test@test.com",
            password: "testpassword",
            confirmed: true
        };

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: { email: "test@test.com", password: "testpassword" }
        })

        const res = createResponse();

        const fakeJWT = 'fakejwt';

        (User.findOne as jest.Mock).mockResolvedValue(userMock);
        (comparePassword as jest.Mock).mockResolvedValue(true);
        (generateJWT as jest.Mock).mockReturnValue(fakeJWT);

        await AuthController.login(req, res);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(data.token).toBe(fakeJWT);
        expect(generateJWT).toHaveBeenCalledWith(userMock.id);

       
    })
})
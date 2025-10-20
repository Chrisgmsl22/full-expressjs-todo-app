import { IJwtPayload, IRegisterRequest, IUser } from "../types";
import { AuthenticationError, ConflictError, ValidationError } from "../utils";
import { AuthService } from "./auth.service";
import { UserModel } from "../models/user.model";
import jwt from "jsonwebtoken"

// Mock the UserModel to avoid database calls
jest.mock("../models/user.model");

// This is a test suite (group of related tests)
describe('AuthService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });
    //Single test
    describe('hashPassword', () => {
        it('Should hash password correctly', async () => {
            // Set up data
            const plainPassword = "myPassword123$$$"
    
            // Act
            const hashedPassword = await AuthService.hashPassword(plainPassword)
    
            // Assert
            expect(hashedPassword).toBeDefined()
            expect(hashedPassword).not.toBe(plainPassword)
    
            // Verufy the actual hash works
            const isValid = await AuthService.comparePassword(plainPassword, hashedPassword)
            expect(isValid).toBe(true)
        })
    
        it('Should return false for an incorrect password', async () => {
            const plainPassword = "myPassword123$$$"
            const wrongPassword = "wrongPassword"
    
            const hashedPassword = await AuthService.hashPassword(plainPassword)
    
            expect(hashedPassword).toBeDefined()
            const isValid = await AuthService.comparePassword(wrongPassword, hashedPassword)
            
            expect(isValid).toBe(false)
            expect(isValid).toBeFalsy()
        })
    })

    describe('createUser', () => {
        describe('email validation', () => {
        
            it('Should throw ValidationError for invalid email format', async () => {
                // Mock UserModel.findOne to return null (no existing user)
                (UserModel.findOne as jest.Mock).mockResolvedValue(null);

                const testEmail = "helloWorld"
                const invalidUserData = {
                    email: testEmail,
                    password: "ValidPassword123",
                    username: "validUser123"
                } as IRegisterRequest

                await expect(AuthService.createUser(invalidUserData))
                    .rejects
                    .toThrow(ValidationError);
                    
                await expect(AuthService.createUser(invalidUserData))
                    .rejects
                    .toThrow("Invalid email format");
            });

            it('Should throw ValidationError for empty email', async () => {
                (UserModel.findOne as jest.Mock).mockResolvedValue(null);

                const invalidUserData = {
                    email: "",
                    password: "ValidPassword123",
                    username: "validUser123"
                } as IRegisterRequest;

                await expect(AuthService.createUser(invalidUserData))
                    .rejects
                    .toThrow(ValidationError);
            });

            it('Should throw ValidationError for email without @', async () => {
                (UserModel.findOne as jest.Mock).mockResolvedValue(null);

                const invalidUserData = {
                    email: "invalidemail.com",
                    password: "ValidPassword123",
                    username: "validUser123"
                } as IRegisterRequest;

                await expect(AuthService.createUser(invalidUserData))
                    .rejects
                    .toThrow("Invalid email format");
            });

            it('Should successfully create user with valid email', async () => {
                // Mock: No existing user found (email/username available)
                (UserModel.findOne as jest.Mock).mockResolvedValue(null);

                // Mock: UserModel constructor and save method
                const mockSave = jest.fn().mockResolvedValue({
                    _id: '123456789',
                    username: 'validUser123',
                    email: 'valid@example.com',
                    password: 'hashed_password_here',
                    isActive: true,
                    emailVerified: false,
                    createdAt: new Date()
                });

                (UserModel as unknown as jest.Mock).mockImplementation(() => ({
                    save: mockSave
                }));

                const validUserData = {
                    email: "valid@example.com",
                    password: "ValidPassword123",
                    username: "validUser123"
                } as IRegisterRequest;

                // Act
                const createdUser = await AuthService.createUser(validUserData);
                

                // Assert
                expect(createdUser).toBeDefined();
                expect(createdUser.email).toBe('valid@example.com');
                expect(createdUser.username).toBe('validUser123');
                expect(createdUser.isActive).toBe(true);
                expect(mockSave).toHaveBeenCalledTimes(1);
            });
        })
        describe('password validation', () => {
            it('Should return error for empty password', async () => {
                (UserModel.findOne as jest.Mock).mockResolvedValue(null);

                const invalidPassword = ""
                const userData = {
                    email: 'valid@example.com',
                    username: "validUser123",
                    password: invalidPassword
                } as IRegisterRequest

                await expect(AuthService.createUser(userData))
                    .rejects
                    .toThrow(AuthenticationError)
            })

            it('Should return error for invalid password', async () => {
                (UserModel.findOne as jest.Mock).mockResolvedValue(null);

                const invalidPassword = "pass"
                const userData = {
                    email: 'valid@example.com',
                    username: "validUser123",
                    password: invalidPassword
                } as IRegisterRequest

                await expect(AuthService.createUser(userData))
                    .rejects
                    .toThrow(AuthenticationError)
            })
        })

        describe('user conflicts', () => {
            it('Should throw exception when a user already exists in DB (email conflict)', async () => {
                const existingUser = {
                    _id: '999',
                    email: 'valid@example.com',  // ← Must match input email!
                    username: 'differentUser',
                    password: 'hashedPassword',
                    isActive: true,
                    emailVerified: false,
                    createdAt: new Date()
                };
                (UserModel.findOne as jest.Mock).mockResolvedValue(existingUser);

                const validUserData = {
                    email: "valid@example.com",
                    password: "ValidPassword123",
                    username: "validUser123"
                } as IRegisterRequest;     
                
                await expect(AuthService.createUser(validUserData))
                    .rejects
                    .toThrow(ConflictError)
                await expect(AuthService.createUser(validUserData))
                    .rejects
                    .toThrow("User with this email already exists")
            })

            it('Should throw exception when a user already exists in DB (username conflict)', async () => {
                const existingUser = {
                    _id: '999',
                    email: 'valid@example.com',  
                    username: 'sameUserName', // Notice how this needs to be the same as the one we'll send
                    password: 'hashedPassword',
                    isActive: true,
                    emailVerified: false,
                    createdAt: new Date()
                };
                (UserModel.findOne as jest.Mock).mockResolvedValue(existingUser);

                const validUserData = {
                    email: "differentEmail@example.com",
                    password: "ValidPassword123",
                    username: "sameUserName"
                } as IRegisterRequest;     
                
                await expect(AuthService.createUser(validUserData))
                    .rejects
                    .toThrow(ConflictError)
                await expect(AuthService.createUser(validUserData))
                    .rejects
                    .toThrow("Username already exists")
            })
        })
    })

    describe('generateToken', () => {
        beforeEach(() => {
            // Set JWT_SECRET for testing
            process.env.JWT_SECRET = 'test-secret-key';
        });
    
        it('Should generate a valid JWT token', () => {
            const mockUser = {
                id: '123456',
                email: 'test@example.com',
                username: 'testuser',
                password: 'hashed',
                isActive: true,
                emailVerified: false,
                createdAt: new Date()
            } as IUser;
    
            const token = AuthService.generateToken(mockUser);
    
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
        });
    
        it('Should include correct payload in token', () => {
            const mockUser = {
                id: '123456',
                email: 'test@example.com',
                username: 'testuser',
                password: 'hashed',
                isActive: true,
                emailVerified: false,
                createdAt: new Date()
            } as IUser;
    
            const token = AuthService.generateToken(mockUser);
            const decoded = jwt.verify(token, 'test-secret-key') as jwt.JwtPayload;
            console.log(decoded)
    
            expect(decoded.userId).toBe('123456');
            expect(decoded.email).toBe('test@example.com');
            expect(decoded.userName).toBe('testuser');
            expect(decoded.exp).toBeDefined()
            expect(decoded.iat).toBeDefined()
        });
    
        it('Should throw error if JWT_SECRET is not configured', () => {
            delete process.env.JWT_SECRET;
    
            const mockUser = {
                id: '123456',
                email: 'test@example.com',
                username: 'testuser',
            } as IUser;
    
            expect(() => AuthService.generateToken(mockUser)).toThrow('JWT_SECRET not configured');
        });
    });

    describe('verifyToken', () => {
        beforeEach(() => {
            process.env.JWT_SECRET = 'test-secret-key';
        });
    
        it('Should successfully verify a valid token', () => {
            // First generate a valid token
            const payload: IJwtPayload = {
                userId: '123',
                email: 'test@example.com',
                userName: 'testuser'
            };
            const token = jwt.sign(payload, 'test-secret-key', { expiresIn: '1h' });
    
            // Verify it
            const result = AuthService.verifyToken(token);
    
            expect(result.valid).toBe(true);
            expect(result.payload).toBeDefined();
            expect(result.payload?.userId).toBe('123');
            expect(result.error).toBeUndefined();
        });
    
        it('Should reject an invalid token', () => {
            const invalidToken = 'invalid.token.here';
    
            const result = AuthService.verifyToken(invalidToken);
    
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Invalid token');
            expect(result.payload).toBeUndefined();
        });
    
        it('Should reject an expired token', () => {
            // Create an expired token (expired 1 second ago)
            const payload: IJwtPayload = {
                userId: '123',
                email: 'test@example.com',
                userName: 'testuser'
            };
            const expiredToken = jwt.sign(payload, 'test-secret-key', { expiresIn: '-1s' });
    
            const result = AuthService.verifyToken(expiredToken);
    
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Token has expired');
        });
    
        it('Should return error if JWT_SECRET is not configured', () => {
            delete process.env.JWT_SECRET;
            
            const token = 'some.token.here';
            const result = AuthService.verifyToken(token);
    
            expect(result.valid).toBe(false);
            expect(result.error).toBe('JWT_SECRET not configured');
        });
    
        it('Should reject token signed with different secret', () => {
            // Sign with different secret
            const payload: IJwtPayload = {
                userId: '123',
                email: 'test@example.com',
                userName: 'testuser'
            };
            // Keep in mind we're defining the env token at the start of this test suite, thats why it will fail
            const token = jwt.sign(payload, 'different-secret', { expiresIn: '1h' });
    
            // Try to verify with our secret
            const result = AuthService.verifyToken(token);
    
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Invalid token');
        });
    });
})


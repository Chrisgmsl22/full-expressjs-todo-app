import { IRegisterRequest } from "../types";
import { ValidationError } from "../utils";
import { AuthService } from "./auth.service";
import { UserModel } from "../models/user.model";

// Mock the UserModel to avoid database calls
jest.mock("../models/user.model");

// This is a test suite (group of related tests)
describe('AuthService', () => {
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

    describe('createUser - email validation', () => {
        beforeEach(() => {
            // Clear all mocks before each test
            jest.clearAllMocks();
        });

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
})


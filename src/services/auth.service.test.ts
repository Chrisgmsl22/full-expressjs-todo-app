import { AuthService } from "./auth.service";

// This is a test suite (group of related tests)
describe('AuthService', () => {
    //Single test
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


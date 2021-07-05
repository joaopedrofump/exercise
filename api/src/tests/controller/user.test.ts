import Controller from "../../controller/controller"
import { userController } from "../../controller/userController"
import { User, UserType } from "../../model/model"
import { EXPIRATION_SECONDS, generateJWTSession, verifyJWTToken } from "../../utils/auth"

describe('User Controller', () => {

    test('create tech user correctly and get', async () => {

        let id : number = 1

        try {
            const result = await userController.create('John Doe', 'abcdEF12', 'johndoe', UserType.technician)
            id = result.id
            const user = await userController.getOne(id)
    
            expect(user.id).toBe(id)
            expect(user.name).toBe('John Doe')
            expect(user.userType).toBe(UserType.technician)
        }
        finally {
            await userController.delete(id)

        }

    })

    test('create manager user correctly and get', async () => {
        
        let id : number = 1

        try {
            const result = await userController.create('John Doe', 'abcdEF12', 'johndoe', UserType.manager)
            id = result.id
            const user = await userController.getOne(id)
    
            expect(user.id).toBe(id)
            expect(user.name).toBe('John Doe')
            expect(user.userType).toBe(UserType.manager)
        }
        finally {
            await userController.delete(id)

        }

    })

    test('create user with no lowercase letter password', async () => {

        return expect(userController.create('John Doe','ABCDEFGHIJ123','johndoe',UserType.technician)).rejects.toBe('Password must be 8 characters long and contain 1 lowercase letter, 1 uppercase letter and 1 number')

    })

    test('create user with no uppercase letter password', async () => {

        return expect(userController.create('John Doe','abcdefghij123','johndoe',UserType.technician)).rejects.toBe('Password must be 8 characters long and contain 1 lowercase letter, 1 uppercase letter and 1 number')

    })

    test('create user with no number password', async () => {

        return expect(userController.create('John Doe','abcdefghijABCD','johndoe',UserType.technician)).rejects.toBe('Password must be 8 characters long and contain 1 lowercase letter, 1 uppercase letter and 1 number')

    })

    test('create user with password less than 8 chars', async () => {

        return expect(userController.create('John Doe','12aA','johndoe',UserType.technician)).rejects.toBe('Password must be 8 characters long and contain 1 lowercase letter, 1 uppercase letter and 1 number')

    })

    test('get all users with manager', async () => {

        let id1 : number = 0
        let id2 : number = 0
        let id3 : number = 0

        try {
            const user1 = await userController.create('John Doe', 'abcdEF12', 'johndoe1', UserType.manager)
            id1=user1.id
            const user2 = await userController.create('John Doe', 'abcdEF12', 'johndoe2', UserType.manager)
            id2=user2.id
            const user3 = await userController.create('John Doe', 'abcdEF12', 'johndoe3', UserType.manager)
            id3=user3.id

            const length = (await userController.list()).length
            expect(length).toBeGreaterThan(1)

        }

        finally {
            await userController.delete(id1)
            await userController.delete(id2)
            await userController.delete(id3)
        }

    })


    test('get all users with tech', async () => {

        let id1 : number = 0
        let id2 : number = 0
        let id3 : number = 0

        try {
            const user1 = await userController.create('John Doe 1', 'abcdEF12', 'johndoe1', UserType.manager)
            id1=user1.id
            const user2 = await userController.create('John Doe 2', 'abcdEF12', 'johndoe2', UserType.manager)
            id2=user2.id
            const user3 = await userController.create('John Doe 3', 'abcdEF12', 'johndoe3', UserType.manager)
            id3=user3.id

            const users = await userController.list(id1)
            expect(users.length).toBe(1)
            expect(users[0].id).toBe(id1)
            expect(users[0].name).toBe('John Doe 1')
            expect(users[0].username).toBe('johndoe1')
            expect(users[0].userType).toBe(UserType.manager)

        }

        finally {
            await userController.delete(id1)
            await userController.delete(id2)
            await userController.delete(id3)
        }

    })

    test('delete own user', async () => {

        let id : number = 1

        try {
            const result = await userController.create('John Doe', 'abcdEF12', 'johndoe', UserType.technician)
            id = result.id
            const total = (await userController.list()).length
            const deleted = await userController.delete(id,id)
            expect(deleted).toBe('User Deleted')
            expect(userController.getOne(id)).resolves.toBe(undefined)
            const totalAfter = (await userController.list()).length
            expect(totalAfter).toBe(total-1)
    
        }
        finally {
            try {
                await userController.delete(id)
            }
            catch(err) {}

        }

    })

    test('delete other user', async () => {

        let id1 : number = 1
        let id2 : number = 2

        try {
            const user1 = await userController.create('John Doe', 'abcdEF12', 'johndoe1', UserType.technician)
            id1 = user1.id
            const user2 = await userController.create('John Doe', 'abcdEF12', 'johndoe2', UserType.technician)
            id2 = user2.id
            const total = (await userController.list()).length
            expect(userController.delete(id1,id2)).rejects.toBe('No permission to update/delete this resource')
            expect(userController.getOne(id1)).toBeTruthy()
            const totalAfter = (await userController.list()).length
            expect(totalAfter).toBe(total)
           
    
        }
        finally {
            try {
                await userController.delete(id1)
                await userController.delete(id2)
            }
            catch(err) {}

        }


    })

    test('delete user with manager', async () => {

        let id : number = 1

        try {
            const result = await userController.create('John Doe', 'abcdEF12', 'johndoe', UserType.technician)
            id = result.id
            const total = (await userController.list()).length
            const deleted = await userController.delete(id)
            expect(deleted).toBe('User Deleted')
            expect(userController.getOne(id)).resolves.toBe(undefined)
            const totalAfter = (await userController.list()).length
            expect(totalAfter).toBe(total-1)
    
        }
        finally {
            try {
                await userController.delete(id)
            }
            catch(err) {}

        }

    })

    test('login correctly', async () => {
        
        let id : number = 1

        try {
            const result = await userController.create('John Doe', 'abcdEF12', 'johndoe', UserType.manager)
            id = result.id
            const user : User = {
                userType: UserType.manager,
                id,
                name: 'John Doe',
                username: 'johndoe'
            }
            expect(userController.login('johndoe','abcdEF12')).resolves.toStrictEqual(user)
        }
        finally {
            await userController.delete(id)

        }

    })

    test('login incorrectly wrong pwd', async () => {
        
        let id : number = 1

        try {
            const result = await userController.create('John Doe', 'abcdEF12', 'johndoe', UserType.manager)
            id = result.id
            const user : User = {
                userType: UserType.manager,
                id,
                name: 'John Doe',
                username: 'johndoe'
            }
            expect(userController.login('johndoe','abcdEF12!')).rejects.toBe('Invalid username or password')
        }
        finally {
            await userController.delete(id)

        }

    })

    test('login incorrectly wrong username', async () => {
        
        let id : number = 1

        try {
            const result = await userController.create('John Doe', 'abcdEF12', 'johndoe', UserType.manager)
            id = result.id
            const user : User = {
                userType: UserType.manager,
                id,
                name: 'John Doe',
                username: 'johndoe'
            }
            expect(userController.login('johndoe1','abcdEF12')).rejects.toBe('Invalid username or password')
        }
        finally {
            await userController.delete(id)

        }

    })


})

describe('Auth Utils', () => {

    test('generate jwt token', async () => {

        const payload = {
            prop1: 'test1',
            prop2: 1
        }

        const token = generateJWTSession(payload, EXPIRATION_SECONDS)
        const verified = await verifyJWTToken(token)
        expect(payload.prop1).toBe('test1')
        expect(payload.prop2).toBe(1)

    })

})


afterAll(async () => {
    Controller.close()
})


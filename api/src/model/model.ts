export enum UserType {
    manager='MANAGER',
    technician="TECHNICIAN"
}

export interface Task {
    id: number
    summary: string
    completionDate?: string
    userId: number
}

export interface User {
    id?: number
    username: string
    name:string
    userType: UserType
}
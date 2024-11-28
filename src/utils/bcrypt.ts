import bcryptjs from "bcryptjs"

export const hashValue = async (value:string, saltRounds?:number) => 
    bcryptjs.hash(value, saltRounds || 10);

export const compareValue = async (value:string, hashedValue:string) => 
    bcryptjs.compare(value, hashedValue).catch(() => false)
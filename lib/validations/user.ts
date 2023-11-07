import * as z from 'zod';

export const UserValidation = z.object({
    profile_photo: z.string().url().nonempty(),
    name: z.string().min(3, {message: 'MIN 3 CHARACTERS'}).max(30, {message:'MAX 30 CHARACTERS'}),
    username: z.string().min(3, {message: 'MIN 3 CHARACTERS'}).max(30, {message:'MAX 30 CHARACTERS'}),
    bio: z.string().min(3, {message: 'MIN 3 CHARACTERS'}).max(1000, {message:'MAX 1000 CHARACTERS'}),
})
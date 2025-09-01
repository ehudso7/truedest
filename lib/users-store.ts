// In-memory user store (replace with database in production)
export const users = new Map<string, {
  id: string
  name: string
  email: string
  password: string
}>()
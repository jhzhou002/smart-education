import jwt, { SignOptions } from 'jsonwebtoken'
import { config } from 'dotenv'

config()

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface JwtPayload {
  userId: number
  email: string
  username: string
}

export function generateToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN
  }
  return jwt.sign(payload, JWT_SECRET, options)
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}

export function refreshToken(payload: JwtPayload): string {
  return generateToken(payload)
}
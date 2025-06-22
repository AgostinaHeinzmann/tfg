import type { UserAttributes } from "../models/User"

declare global {
  namespace Express {
    interface Request {
      user?: UserAttributes
    }
  }
}

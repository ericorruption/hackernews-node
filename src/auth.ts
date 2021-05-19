import jwt from "jsonwebtoken";
import type { Request } from "express";

export type UserId = string;

interface DecodedToken {
  userId: UserId;
}

const getTokenPayload = (token: string) => {
  const result = jwt.verify(token, process.env.APP_SECRET!);

  if (typeof result === "string") {
    throw new Error("Malformed token");
  }

  return result as DecodedToken;
};

export const getUserId = (req: Request, authToken?: string) => {
  if (req && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      throw new Error("No token found");
    }

    const decodedToken = getTokenPayload(token);
    return decodedToken.userId;
  }

  if (authToken) {
    const decodedToken = getTokenPayload(authToken);
    return decodedToken.userId;
  }

  throw new Error("Not authenticated");
};

import client from "./client";
import type { Token, UserCreate, UserResponse } from "../types";

export const register = (data: UserCreate) =>
  client.post<UserResponse>("/auth/register", data);

export const login = (data: UserCreate) =>
  client.post<Token>("/auth/login", data);

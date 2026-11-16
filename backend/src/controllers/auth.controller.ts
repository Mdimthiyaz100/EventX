import type { RequestHandler } from "express";
import * as authService from "../services/auth.service.js";
import { sendData } from "../utils/http.js";

export const register: RequestHandler = async (request, response) => {
  const result = await authService.register(request.body);
  sendData(response, result, 201);
};

export const login: RequestHandler = async (request, response) => {
  sendData(response, await authService.login(request.body));
};

export const refresh: RequestHandler = async (request, response) => {
  sendData(response, await authService.refresh(request.body.refreshToken));
};

export const logout: RequestHandler = async (request, response) => {
  await authService.logout(request.body.refreshToken);
  sendData(response, { loggedOut: true });
};

export const me: RequestHandler = async (request, response) => {
  sendData(response, await authService.getProfile(request.auth!.userId));
};

export const updateMe: RequestHandler = async (request, response) => {
  sendData(
    response,
    await authService.updateProfile(request.auth!.userId, request.body),
  );
};
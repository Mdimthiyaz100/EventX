import type { RequestHandler } from "express";
import * as authService from "../services/auth.service.js";
import { sendData } from "../utils/http.js";

export const register: RequestHandler = async (request, response) => {
  const result = await authService.register(request.body);
  sendData(response, result, 201);
};

export const registerOrganizer: RequestHandler = async (request, response) => {
  const result = await authService.registerOrganizer(request.body);
  sendData(response, result, 201);
};

export const loginOrganizer: RequestHandler = async (request, response) => {
  const result = await authService.loginOrganizer(request.body);
  sendData(response, result);
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

export const getSecurityQuestions: RequestHandler = async (_request, response) => {
  const questions = await authService.getActiveSecurityQuestions();
  sendData(response, questions);
};

export const getSecurityStatus: RequestHandler = async (request, response) => {
  const status = await authService.getUserSecurityStatus(request.auth!.userId);
  sendData(response, status);
};

export const setupSecurityQuestions: RequestHandler = async (request, response) => {
  const result = await authService.setupUserSecurityQuestions(
    request.auth!.userId,
    request.body.answers,
  );
  sendData(response, result);
};

export const forgotPassword: RequestHandler = async (request, response) => {
  const result = await authService.forgotPasswordInitiate(request.body.email);
  sendData(response, result);
};

export const verifySecurityAnswers: RequestHandler = async (request, response) => {
  const result = await authService.verifySecurityAnswers(
    request.body.email,
    request.body.answers,
  );
  sendData(response, result);
};

export const resetPasswordSecurity: RequestHandler = async (request, response) => {
  const result = await authService.resetPasswordWithSecurityToken(
    request.body.recoveryToken,
    request.body.newPassword,
  );
  sendData(response, result);
};

import { errorCode } from "../config/errorCode";

export const checkUserExist = (user: any) => {
  if (user) {
    const error: any = new Error("This email has already been registered");
    error.status = 409;
    error.code = errorCode.userExist;
    throw error;
  }
};

export const checkUserIfNotExist = (user: any) => {
  if (!user) {
    const error: any = new Error("This email has not registered");
    error.status = 401;
    error.code = errorCode.unauthenticated;
    throw error;
  }
};

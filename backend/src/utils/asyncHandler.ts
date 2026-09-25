import type { NextFunction, RequestHandler, Response } from "express";
import type { AuthedRequest } from "../middlewares/authMiddleware";

type ControllerHandler = (req: AuthedRequest, res: Response, next: NextFunction) => unknown;

/** 控制器统一捕获异步异常并交给 errorHandler，service/controller 抛出的业务错误不被吞掉。 */
export const asyncHandler =
  (handler: ControllerHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(handler(req as AuthedRequest, res, next)).catch(next);

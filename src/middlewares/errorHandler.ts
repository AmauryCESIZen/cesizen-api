import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";

const errorHandling: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  console.error(err.stack);
  res.status(500).json({
    status: 500,
    message: "Something went wrong",
    error: err.message,
  });
};

export default errorHandling;

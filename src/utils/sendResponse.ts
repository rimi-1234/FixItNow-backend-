import { Response } from 'express';

type IApiReponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string | null;
  data?: T | null;
  errorDetails?: any;
};

export const sendResponse = <T>(res: Response, data: IApiReponse<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data || undefined,
    errorDetails: data.errorDetails || undefined,
  });
};

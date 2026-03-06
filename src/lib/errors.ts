import z, { ZodError } from 'zod';

export type Errors = NetworkError | JsonParseError | HttpError | z.ZodError | Error;

export type SerializedError = {
  type: 'NetworkError' | 'JsonParseError' | 'HttpError' | 'ZodError' | 'UnknownError';
  message: string;
  name?: string;
  status?: number;
  details?: unknown;
};

export abstract class CustomError extends Error {
  abstract toJSON(): SerializedError;
}

export class HttpError extends CustomError {
  constructor(
    public response: Response,
    message?: string
  ) {
    super(message ?? `HTTP Error: ${response.status} ${response.statusText}`);
    this.name = 'HttpError';
  }

  toJSON(): SerializedError {
    return {
      type: 'HttpError',
      name: this.name,
      message: this.message,
      status: this.response.status,
    };
  }
}

export class JsonParseError extends CustomError {
  constructor(public response: Response) {
    super(`JSON Parse Error: ${response.status} ${response.statusText}`);
    this.name = 'JsonParseError';
  }

  toJSON(): SerializedError {
    return {
      type: 'JsonParseError',
      name: this.name,
      message: this.message,
      status: this.response.status,
    };
  }
}

export class NetworkError extends CustomError {
  constructor(public error: unknown) {
    super(error instanceof Error ? error.message : String(error));
    this.name = 'NetworkError';
  }

  toJSON(): SerializedError {
    return {
      type: 'NetworkError',
      name: this.name,
      message: this.message,
      details: this.error,
    };
  }
}

/**
 * @description RSCからclientにはシリアライズ可能なものにしか渡せないため、Errorをシリアライズするユーティリティ
 * @param error
 * @returns SerializedError
 */
export const serializeError = (error: unknown): SerializedError => {
  if (error instanceof CustomError) {
    return error.toJSON();
  }

  if (error instanceof ZodError) {
    return {
      type: 'ZodError',
      name: error.name,
      message: error.message,
      details: z.flattenError(error),
    };
  }

  return {
    type: 'UnknownError',
    message: error instanceof Error ? error.message : 'An unknown error occurred',
  };
};

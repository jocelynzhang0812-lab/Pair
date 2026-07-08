import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

interface ErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json(this.toBody(exception, status));
  }

  private toBody(exception: unknown, status: number): ErrorBody {
    if (!(exception instanceof HttpException)) {
      return {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      };
    }

    const payload = exception.getResponse();
    if (typeof payload === 'string') {
      return {
        code: this.codeFromStatus(status),
        message: payload,
      };
    }

    if (this.isRecord(payload)) {
      const message = this.messageFromPayload(payload);
      return {
        code:
          typeof payload.code === 'string' ? payload.code : this.codeFromStatus(status),
        message,
        details: payload.details ?? payload.message,
      };
    }

    return {
      code: this.codeFromStatus(status),
      message: exception.message,
    };
  }

  private messageFromPayload(payload: Record<string, unknown>): string {
    if (typeof payload.message === 'string') {
      return payload.message;
    }

    if (Array.isArray(payload.message)) {
      return 'Validation failed';
    }

    if (typeof payload.error === 'string') {
      return payload.error;
    }

    return 'Request failed';
  }

  private codeFromStatus(status: number): string {
    const codeByStatus: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
      [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
    };

    return codeByStatus[status] ?? 'INTERNAL_SERVER_ERROR';
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}

import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class CustomThrottleGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    if (req.user && (req.user as any).id) {
      return `user:${(req.user as any).id}`;
    }
    return req.ip || 'unknown';
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: any
  ): Promise<void> {
    throw new ThrottlerException('Too many requests. Please try again later.');
  }
}


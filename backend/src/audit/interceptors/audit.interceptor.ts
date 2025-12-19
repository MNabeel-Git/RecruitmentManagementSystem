import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditService } from '../audit.service';
import { AuditAction, AuditResource } from '../schemas/audit-log.schema';
import { AUDIT_METADATA_KEY, AuditMetadata } from '../decorators/audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private auditService: AuditService,
    private reflector: Reflector
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const controller = context.getClass();

    const auditMetadata = this.reflector.getAllAndOverride<AuditMetadata>(
      AUDIT_METADATA_KEY,
      [handler, controller]
    );

    if (!auditMetadata) {
      return next.handle();
    }

    const user = request.user;
    const tenantId = user?.tenantId || request.headers['x-tenant-id'] || null;
    const userId = user?.id || user?.sub || null;
    const ipAddress = request.ip || request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'];

    let oldValues: any = {};
    let resourceId: string | null = null;

    if (request.params?.id) {
      resourceId = request.params.id;
    } else if (request.body?.id) {
      resourceId = request.body.id;
    }

    if (auditMetadata.action === AuditAction.UPDATE || auditMetadata.action === AuditAction.DELETE) {
      if (resourceId) {
        oldValues = { id: resourceId };
      }
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          let newResourceId = resourceId;
          let newValues: any = {};

          if (auditMetadata.action === AuditAction.CREATE && response?.id) {
            newResourceId = response.id;
            newValues = this.sanitizeResponse(response);
          } else if (auditMetadata.action === AuditAction.UPDATE && response) {
            newValues = this.sanitizeResponse(response);
          }

          await this.auditService.log(
            tenantId,
            userId,
            auditMetadata.action,
            auditMetadata.resource,
            newResourceId || resourceId || '',
            oldValues,
            newValues,
            ipAddress,
            userAgent,
            'SUCCESS'
          );
        } catch (error) {
          console.error('Audit logging error:', error);
        }
      }),
      catchError(async (error) => {
        try {
          await this.auditService.log(
            tenantId,
            userId,
            auditMetadata.action,
            auditMetadata.resource,
            resourceId || '',
            oldValues,
            {},
            ipAddress,
            userAgent,
            'ERROR',
            error.message
          );
        } catch (auditError) {
          console.error('Audit logging error:', auditError);
        }
        throw error;
      })
    );
  }

  private sanitizeResponse(response: any): any {
    if (!response || typeof response !== 'object') {
      return {};
    }

    const sanitized: any = {};
    const sensitiveFields = ['password', 'refreshToken', 'accessToken'];

    for (const key in response) {
      if (sensitiveFields.includes(key.toLowerCase())) {
        continue;
      }
      if (typeof response[key] === 'object' && response[key] !== null && !Array.isArray(response[key])) {
        sanitized[key] = this.sanitizeResponse(response[key]);
      } else {
        sanitized[key] = response[key];
      }
    }

    return sanitized;
  }
}


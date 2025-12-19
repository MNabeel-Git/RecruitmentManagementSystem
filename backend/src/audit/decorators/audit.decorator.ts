import { SetMetadata } from '@nestjs/common';
import { AuditAction, AuditResource } from '../schemas/audit-log.schema';

export const AUDIT_METADATA_KEY = 'audit';

export interface AuditMetadata {
  action: AuditAction;
  resource: AuditResource;
}

export const Audit = (action: AuditAction, resource: AuditResource) =>
  SetMetadata(AUDIT_METADATA_KEY, { action, resource } as AuditMetadata);


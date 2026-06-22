import type { DynamicModule } from '@nestjs/common';
import { adminOptions } from './admin.config';

export function getAdminPanelModule(): Promise<DynamicModule> {
  return import('@adminjs/nestjs').then(async ({ AdminModule }) => {
    const [{ default: AdminJS }, { Database, Resource }] = await Promise.all([
      import('adminjs'),
      import('@adminjs/prisma'),
    ]);

    AdminJS.registerAdapter({ Database, Resource });

    return AdminModule.createAdminAsync({
      useFactory: async () => ({
        adminJsOptions: adminOptions,
      }),
    });
  });
}

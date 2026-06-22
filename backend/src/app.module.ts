import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { getAdminPanelModule } from './admin/admin.module';

const optionalImports =
  process.env.NODE_ENV === 'test' ? [] : [getAdminPanelModule()];

@Module({
  imports: [PrismaModule, ...optionalImports],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

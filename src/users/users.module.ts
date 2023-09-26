import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController, AuthController],
  providers: [AuthService],
})
export class UsersModule {}

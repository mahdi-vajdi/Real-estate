import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserController, AuthController],
  providers: [AuthService],
})
export class UserModule {}

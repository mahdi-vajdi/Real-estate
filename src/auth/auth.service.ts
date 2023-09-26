import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { UserType } from '@prisma/client';

interface SignupParams {
  email: string;
  name: string;
  phone: string;
  password: string;
}

interface SigninParams {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup(
    { email, name, phone, password }: SignupParams,
    userType: UserType,
  ) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (userExists) throw new ConflictException();

    // Hash the password
    const hashedPass = await bcrypt.hash(password, 10);

    const user = await this.prismaService.user.create({
      data: {
        email,
        name,
        phone,
        password: hashedPass,
        user_type: userType,
      },
    });

    return this.generateJwt(user.name, user.id);
  }

  async signin({ email, password }: SigninParams) {
    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (!user) throw new HttpException('Invalid Creditials', 400);

    const isPassValid = await bcrypt.compare(password, user.password);

    if (!isPassValid) throw new HttpException('Invalid Creditials', 400);

    return this.generateJwt(user.name, user.id);
  }

  private generateJwt(name: string, id: number) {
    const token = jwt.sign({ name, id }, process.env.JWT_SECRET, {
      expiresIn: 36000,
    });
    return token;
  }

  async generateProductKey(email: string, userType: UserType) {
    const string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;

    return await bcrypt.hash(string, 10);
  }
}

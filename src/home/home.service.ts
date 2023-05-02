import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dto/home.dto';
import { PropertyType } from '@prisma/client';

interface CreateHomeParams {
  address: string;
  numberOfbedrooms: number;
  numberOfBathrooms: number;
  city: string;
  price: number;
  landSize: number;
  propertyType: PropertyType;
  images: { url: string }[];
}

interface HomeFilterParam {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType;
}

export const homeSelect = {
  id: true,
  address: true,
  city: true,
  price: true,
  property_type: true,
  no_bathroom: true,
  no_bedrooms: true,
};

interface UpdateHomeParams {
  address?: string;
  numberOfbedrooms?: number;
  numberOfBathrooms?: number;
  city?: string;
  price?: number;
  landSize?: number;
  propertyType?: PropertyType;
}

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async createHome({
    address,
    numberOfbedrooms,
    numberOfBathrooms,
    city,
    price,
    landSize,
    propertyType,
    images,
  }: CreateHomeParams) {
    const home = await this.prismaService.home.create({
      data: {
        address,
        no_bathroom: numberOfBathrooms,
        no_bedrooms: numberOfbedrooms,
        land_size: landSize,
        property_type: propertyType,
        price,
        city,
        realtor_id: 6,
      },
    });

    const homeImages = images.map((image) => {
      return { ...image, home_id: home.id };
    });

    await this.prismaService.image.createMany({ data: homeImages });

    return new HomeResponseDto(home);
  }

  async getAllHomes(filters: HomeFilterParam): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        property_type: true,
        no_bathroom: true,
        no_bedrooms: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      where: filters,
    });

    if (!homes.length) throw new NotFoundException();

    return homes.map((home) => {
      return new HomeResponseDto(home);
    });
  }

  async getHomeById(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
      select: {
        ...homeSelect,
        images: {
          select: {
            url: true,
          },
        },
      },
    });

    if (!home) throw new NotFoundException();

    return new HomeResponseDto(home);
  }

  async updateHome(id: number, data: UpdateHomeParams) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
    });

    if (!home) throw new NotFoundException();

    const updatedHome = await this.prismaService.home.update({
      where: {
        id,
      },
      data,
    });

    return new HomeResponseDto(updatedHome);
  }

  async deletHomeById(id: number) {
    await this.prismaService.image.deleteMany({
      where: {
        home_id: id,
      },
    });

    await this.prismaService.home.delete({
      where: {
        id,
      },
    });
  }
}

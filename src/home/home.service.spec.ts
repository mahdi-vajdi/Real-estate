import { Test, TestingModule } from '@nestjs/testing';
import { HomeService } from './home.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyType } from '@prisma/client';
import { homeSelect } from './home.service';
import { NotFoundException } from '@nestjs/common';

const mockGetHomes = [
  {
    id: 2,
    address: 'street 1 - no 2',
    city: 'London',
    price: 1200000,
    images: [
      {
        url: 'img/1.com',
      },
    ],
    numberOfBedrooms: 2,
    numberOfBathrooms: 2,
    propertyType: PropertyType.RESIDENTIAL,
  },
];

const mockHome = {
  id: 2,
  address: 'street 1 - no 2',
  city: 'London',
  price: 1200000,
  images: [
    {
      url: 'img/1.com',
    },
  ],
  number_of_bedrooms: 2,
  number_of_bathrooms: 2,
  property_type: PropertyType.RESIDENTIAL,
};

const mockImages = [
  {
    id: 1,
    url: 'img/1.com',
  },
  {
    id: 2,
    url: 'img/2.com',
  },
];

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockReturnValue(mockGetHomes),
              create: jest.fn().mockReturnValue(mockHome),
            },
            image: {
              createMany: jest.fn().mockReturnValue(mockImages),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHomes', () => {
    const filters = {
      city: 'London',
      price: {
        gte: 1000000,
        lte: 1500000,
      },
      propertyType: PropertyType.RESIDENTIAL,
    };

    it('should call prisma home.findMany with conrrect prameters', async () => {
      const mockPrismaHomeFindMany = jest.fn().mockReturnValue(mockGetHomes);
      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaHomeFindMany);

      await service.getAllHomes(filters);
      expect(mockPrismaHomeFindMany).toBeCalledWith({
        select: {
          ...homeSelect,
          images: {
            select: {
              url: true,
            },
            take: 1,
          },
        },
        where: filters,
      });
    });

    it('should throw NotFoundExpection if no homes are found', async () => {
      const mockPrismaHomeFindMany = jest.fn().mockReturnValue([]);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaHomeFindMany);

      await expect(service.getAllHomes(filters)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('createHome', () => {
    const mockCreateHomeParams = {
      numberOfbedrooms: 4,
      numberOfBathrooms: 5,
      address: 'street 2, no 9',
      city: 'Berlin',
      landSize: 400,
      price: 1350000,
      propertyType: PropertyType.RESIDENTIAL,
      images: [
        {
          url: 'img/10.com',
        },
      ],
    };
    it('should call prisma.home.create with the correct payload', async () => {
      const mockCreateHome = jest.fn().mockReturnValue(mockHome);

      jest
        .spyOn(prismaService.home, 'create')
        .mockImplementation(mockCreateHome);

      await service.createHome(mockCreateHomeParams, 6);

      expect(mockCreateHome).toBeCalledWith({
        data: {
          no_bedrooms: 4,
          no_bathroom: 5,
          address: 'street 2, no 9',
          city: 'Berlin',
          land_size: 400,
          price: 1350000,
          realtor_id: 6,
          property_type: PropertyType.RESIDENTIAL,
        },
      });
    });

    it('should call prisma.image.createMany with correct payload', async () => {
      const mockCreateMayImage = jest.fn().mockReturnValue(mockHome);

      jest
        .spyOn(prismaService.image, 'createMany')
        .mockImplementation(mockCreateMayImage);

      await service.createHome(mockCreateHomeParams, 6);

      expect(mockCreateMayImage).toBeCalledWith({
        data: [
          {
            url: 'img/10.com',
            home_id: 2,
          },
        ],
      });
    });
  });
});

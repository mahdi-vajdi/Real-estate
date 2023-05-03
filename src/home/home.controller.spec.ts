import { Test, TestingModule } from '@nestjs/testing';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyType } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';

const mockUser = {
  id: 54,
  name: 'Mahdi',
  email: 'mahdi@mahdi.com',
  phone: '555 555 5555',
};

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

describe('HomeController', () => {
  let controller: HomeController;
  let homeService: HomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        {
          provide: HomeService,
          useValue: {
            getAllHomes: jest.fn().mockReturnValue([]),
            getRealtorByHomeId: jest.fn().mockReturnValue(mockUser),
            updateHomeById: jest.fn().mockReturnValue(mockHome),
            updateHome: jest.fn().mockRejectedValue(mockHome),
          },
        },
        PrismaService,
      ],
    }).compile();

    controller = module.get<HomeController>(HomeController);
    homeService = module.get<HomeService>(HomeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHomes', () => {
    it('should construct filter object correctly', async () => {
      const mockGetHomes = jest.fn().mockReturnValue([]);
      jest.spyOn(homeService, 'getAllHomes').mockImplementation(mockGetHomes);
      await controller.getHomes('London', '1000000');

      expect(mockGetHomes).toBeCalledWith({
        city: 'London',
        price: {
          gte: 1000000,
        },
      });
    });
  });

  describe('updateHome', () => {
    const mockUserInfo = {
      name: 'Mahdi',
      id: 30,
      iat: 1,
      exp: 2,
    };
    const mockUpdateHomeParams = {
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

    it('should throw UnauthorizedException if realtor did not create home', async () => {
      await expect(
        controller.updateHome(5, mockUpdateHomeParams, mockUserInfo),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should update home if realtor id is valid', async () => {
      const mockUpdateHome = jest.fn().mockReturnValue(mockHome);

      jest.spyOn(homeService, 'updateHome').mockImplementation(mockUpdateHome);

      await controller.updateHome(5, mockUpdateHomeParams, {
        ...mockUserInfo,
        id: 54,
      });

      expect(mockUpdateHome).toBeCalled();
    });
  });
});

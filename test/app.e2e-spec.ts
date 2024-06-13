import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AppService } from '../src/app.service';
import { CreateMemberDto } from '../src/DTOS';

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let appService: AppService;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(AppService)
            .useValue({
                register: jest.fn(),
                createMonthlyMembership: jest.fn(),
                generateInvoice: jest.fn(),
            })
            .compile();

        app = moduleFixture.createNestApplication();
        appService = moduleFixture.get<AppService>(AppService);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /new-member', () => {
        it('should register a new member', async () => {
            const createMemberDto: CreateMemberDto = {
                email: 'test@example.com',
                firstName: 'Test User',
                lastName: '2024'
            };
            const expectedResult = { id: '1', ...createMemberDto };

            jest.spyOn(appService, 'register').mockResolvedValue(expectedResult as any);

            return await request(app.getHttpServer())
                .post('/new-member')
                .send(createMemberDto)
                .expect(201)
                .expect(expectedResult);
        });
    });

    describe('POST /monthly-service', () => {
        it('should create a monthly service for a membership', async () => {
            const membershipId = '1';
            const expectedResult = { affected: 1 };

            jest.spyOn(appService, 'createMonthlyMembership').mockResolvedValue(expectedResult as any);

            return await request(app.getHttpServer())
                .post('/monthly-service')
                .query({ membershipId })
                .expect(201)
                .expect(expectedResult);
        });
    });

    describe('GET /invoice', () => {
        it('should generate an invoice for a membership', async () => {
            const membershipId = '1';
            const expectedResult = { id: '1', amount: 500 };

            jest.spyOn(appService, 'generateInvoice').mockResolvedValue(expectedResult as any);

            return await request(app.getHttpServer())
                .get('/invoice')
                .query({ membershipId })
                .expect(200)
                .expect(expectedResult);
        });
    });
});
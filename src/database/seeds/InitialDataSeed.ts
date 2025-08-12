import { DataSource } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Farmer } from '../../entities/farmer.entity';
import { Farm } from '../../entities/farm.entity';
import { Harvest } from '../../entities/harvest.entity';
import { Crop } from '../../entities/crop.entity';
import { faker } from '@faker-js/faker';

export class InitialDataSeed {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log('🌱 Starting data seeding...');

    // Clear existing data (optional - comment out if you want to keep existing data)
    await this.clearExistingData();

    // Create users
    const users = await this.createUsers();
    console.log(`✅ Created ${users.length} users`);

    // Create farmers
    const farmers = await this.createFarmers();
    console.log(`✅ Created ${farmers.length} farmers`);

    // Create farms
    const farms = await this.createFarms(farmers);
    console.log(`✅ Created ${farms.length} farms`);

    // Create harvests
    const harvests = await this.createHarvests(farms);
    console.log(`✅ Created ${harvests.length} harvests`);

    // Create crops
    const crops = await this.createCrops(harvests, farms);
    console.log(`✅ Created ${crops.length} crops`);

    console.log('🎉 All data seeded successfully!');
  }

  private async clearExistingData(): Promise<void> {
    console.log('🧹 Clearing existing data...');
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      // Disable foreign key checks temporarily
      await queryRunner.query('SET session_replication_role = replica;');
      
      // Clear tables in reverse dependency order
      await queryRunner.query('TRUNCATE TABLE "crops" CASCADE');
      await queryRunner.query('TRUNCATE TABLE "harvests" CASCADE');
      await queryRunner.query('TRUNCATE TABLE "farms" CASCADE');
      await queryRunner.query('TRUNCATE TABLE "farmers" CASCADE');
      await queryRunner.query('TRUNCATE TABLE "users" CASCADE');
      
      // Re-enable foreign key checks
      await queryRunner.query('SET session_replication_role = DEFAULT;');
      
      console.log('✅ Existing data cleared');
    } finally {
      await queryRunner.release();
    }
  }

  private async createUsers(): Promise<User[]> {
    const userRepository = this.dataSource.getRepository(User);
    const users: Partial<User>[] = [];

    for (let i = 0; i < 500; i++) {
      const user = {
        email: faker.internet.email(),
        password: 'password123', // Will be hashed by @BeforeInsert
      };
      users.push(user);
    }

    return await userRepository.save(users);
  }

  private async createFarmers(): Promise<Farmer[]> {
    const farmerRepository = this.dataSource.getRepository(Farmer);
    const farmers: Partial<Farmer>[] = [];

    for (let i = 0; i < 500; i++) {
      // Randomly decide if farmer has CPF or CNPJ (not both)
      const hasCPF = Math.random() > 0.5;
      
      const farmer = {
        name: faker.person.fullName(),
        cpf: hasCPF ? this.generateValidCPF() : undefined,
        cnpj: !hasCPF ? this.generateValidCNPJ() : undefined,
      };
      
      farmers.push(farmer);
    }

    return await farmerRepository.save(farmers);
  }

  private async createFarms(farmers: Farmer[]): Promise<Farm[]> {
    const farmRepository = this.dataSource.getRepository(Farm);
    const farms: Partial<Farm>[] = [];

    const brazilianCities = [
      'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 'Salvador',
      'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife',
      'Porto Alegre', 'Belém', 'Goiânia', 'Guarulhos', 'Campinas',
      'Nova Iguaçu', 'São Gonçalo', 'Mauá', 'Duque de Caxias', 'São José dos Campos'
    ];

    const brazilianStates = [
      'SP', 'RJ', 'MG', 'DF', 'BA', 'CE', 'AM', 'PR', 'PE', 'RS',
      'PA', 'GO', 'SC', 'ES', 'PB', 'RN', 'MT', 'AL', 'PI', 'MS'
    ];

    for (let i = 0; i < 500; i++) {
      const totalArea = parseFloat(faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }).toFixed(2));
      const cultivationArea = parseFloat(faker.number.float({ min: 5, max: totalArea * 0.8, fractionDigits: 2 }).toFixed(2));
      const vegetationArea = parseFloat(faker.number.float({ min: 2, max: totalArea - cultivationArea, fractionDigits: 2 }).toFixed(2));

      const farm = {
        name: `${faker.company.name()} - ${faker.location.street()}`,
        city: faker.helpers.arrayElement(brazilianCities),
        state: faker.helpers.arrayElement(brazilianStates),
        totalArea,
        cultivationArea,
        vegetationArea,
        farmerId: farmers[i % farmers.length].id, // Distribute farms among farmers
      };

      farms.push(farm);
    }

    return await farmRepository.save(farms);
  }

  private async createHarvests(farms: Farm[]): Promise<Harvest[]> {
    const harvestRepository = this.dataSource.getRepository(Harvest);
    const harvests: Partial<Harvest>[] = [];

    for (let i = 0; i < 500; i++) {
      const harvest = {
        year: faker.number.int({ min: 2020, max: 2024 }),
        farmId: farms[i % farms.length].id, // Use farmId instead of farm object
      };

      harvests.push(harvest);
    }

    return await harvestRepository.save(harvests);
  }

  private async createCrops(harvests: Harvest[], farms: Farm[]): Promise<Crop[]> {
    const cropRepository = this.dataSource.getRepository(Crop);
    const crops: Partial<Crop>[] = [];

    const cropNames = [
      'Soja', 'Milho', 'Arroz', 'Feijão', 'Trigo', 'Café', 'Cana-de-açúcar',
      'Algodão', 'Laranja', 'Banana', 'Uva', 'Maçã', 'Tomate', 'Cenoura',
      'Batata', 'Cebola', 'Alho', 'Pimentão', 'Beringela', 'Abóbora',
      'Melancia', 'Melão', 'Manga', 'Abacaxi', 'Limão', 'Tangerina',
      'Pêssego', 'Ameixa', 'Pera', 'Kiwi', 'Framboesa', 'Morango'
    ];

    for (let i = 0; i < 500; i++) {
      const crop = {
        name: faker.helpers.arrayElement(cropNames),
        harvestId: harvests[i % harvests.length].id, // Use harvestId instead of harvest object
        farmId: farms[i % farms.length].id, // Use farmId instead of farm object
      };

      crops.push(crop);
    }

    return await cropRepository.save(crops);
  }

  private generateValidCPF(): string {
    // Generate a valid CPF format (XXX.XXX.XXX-XX)
    const numbers = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
    
    // Calculate first digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += numbers[i] * (10 - i);
    }
    const firstDigit = ((sum * 10) % 11) % 10;
    
    // Calculate second digit
    numbers.push(firstDigit);
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += numbers[i] * (11 - i);
    }
    const secondDigit = ((sum * 10) % 11) % 10;
    numbers.push(secondDigit);
    
    return numbers.join('').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  private generateValidCNPJ(): string {
    // Generate a valid CNPJ format (XX.XXX.XXX/XXXX-XX)
    const numbers = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
    
    // Calculate first digit
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += numbers[i] * weights1[i];
    }
    const firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    // Calculate second digit
    numbers.push(firstDigit);
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += numbers[i] * weights2[i];
    }
    const secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    numbers.push(secondDigit);
    
    return numbers.join('').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
}

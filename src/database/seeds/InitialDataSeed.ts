import { DataSource } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Farmer } from '../../entities/farmer.entity';
import { Farm } from '../../entities/farm.entity';
import { Crop } from '../../entities/crop.entity';
import { Harvest } from '../../entities/harvest.entity';
import * as bcrypt from 'bcrypt';

export class InitialDataSeed {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log('🌱 Starting database seeding...');

    // Create admin user
    const adminUser = await this.createAdminUser();
    console.log('✅ Admin user created:', adminUser.email);

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
    const crops = await this.createCrops(harvests);
    console.log(`✅ Created ${crops.length} crops`);

    console.log('🎉 Database seeding completed successfully!');
  }

  private async createAdminUser(): Promise<User> {
    const userRepository = this.dataSource.getRepository(User);
    
    // Check if admin already exists
    let adminUser = await userRepository.findOne({ where: { email: 'admin@admin.com' } });
    
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      adminUser = userRepository.create({
        email: 'admin@admin.com',
        password: hashedPassword,
      });
      
      await userRepository.save(adminUser);
    }
    
    return adminUser;
  }

  private async createFarmers(): Promise<Farmer[]> {
    const farmerRepository = this.dataSource.getRepository(Farmer);
    
    const farmersData = [
      {
        name: 'João Silva',
        cpf: '123.456.789-01',
        cnpj: undefined,
      },
      {
        name: 'Maria Santos',
        cpf: undefined,
        cnpj: '12.345.678/0001-90',
      },
      {
        name: 'Pedro Oliveira',
        cpf: '456.789.123-45',
        cnpj: undefined,
      },
    ];

    const farmers: Farmer[] = [];
    
    for (const farmerData of farmersData) {
      let farmer: Farmer | null = null;
      
      if (farmerData.cpf) {
        farmer = await farmerRepository.findOne({ where: { cpf: farmerData.cpf } });
      } else if (farmerData.cnpj) {
        farmer = await farmerRepository.findOne({ where: { cnpj: farmerData.cnpj } });
      }
      
      if (!farmer) {
        farmer = farmerRepository.create(farmerData);
        await farmerRepository.save(farmer);
      }
      
      farmers.push(farmer);
    }
    
    return farmers;
  }

  private async createFarms(farmers: Farmer[]): Promise<Farm[]> {
    const farmRepository = this.dataSource.getRepository(Farm);
    
    const farmsData = [
      {
        name: 'Fazenda São João',
        city: 'São Paulo',
        state: 'SP',
        totalArea: 150.5,
        cultivationArea: 120.0,
        vegetationArea: 30.5,
        farmer: farmers[0],
      },
      {
        name: 'Sítio Boa Vista',
        city: 'Rio de Janeiro',
        state: 'RJ',
        totalArea: 75.2,
        cultivationArea: 60.0,
        vegetationArea: 15.2,
        farmer: farmers[1],
      },
      {
        name: 'Chácara Verde',
        city: 'Belo Horizonte',
        state: 'MG',
        totalArea: 200.0,
        cultivationArea: 150.0,
        vegetationArea: 50.0,
        farmer: farmers[2],
      },
    ];

    const farms: Farm[] = [];
    
    for (const farmData of farmsData) {
      let farm = await farmRepository.findOne({ 
        where: { 
          name: farmData.name,
        } 
      });
      
      if (!farm) {
        farm = farmRepository.create(farmData);
        await farmRepository.save(farm);
      }
      
      farms.push(farm);
    }
    
    return farms;
  }

  private async createHarvests(farms: Farm[]): Promise<Harvest[]> {
    const harvestRepository = this.dataSource.getRepository(Harvest);
    
    const harvestsData = [
      {
        year: 2024,
        farm: farms[0],
      },
      {
        year: 2024,
        farm: farms[1],
      },
      {
        year: 2023,
        farm: farms[2],
      },
      {
        year: 2024,
        farm: farms[2],
      },
    ];

    const harvests: Harvest[] = [];
    
    for (const harvestData of harvestsData) {
      let harvest = await harvestRepository.findOne({ 
        where: { 
          year: harvestData.year,
        } 
      });
      
      if (!harvest) {
        harvest = harvestRepository.create(harvestData);
        await harvestRepository.save(harvest);
      }
      
      harvests.push(harvest);
    }
    
    return harvests;
  }

  private async createCrops(harvests: Harvest[]): Promise<Crop[]> {
    const cropRepository = this.dataSource.getRepository(Crop);
    
    const cropsData = [
      {
        name: 'Milho',
        harvest: harvests[0],
      },
      {
        name: 'Soja',
        harvest: harvests[0],
      },
      {
        name: 'Café',
        harvest: harvests[1],
      },
      {
        name: 'Feijão',
        harvest: harvests[2],
      },
      {
        name: 'Arroz',
        harvest: harvests[3],
      },
    ];

    const crops: Crop[] = [];
    
    for (const cropData of cropsData) {
      let crop = await cropRepository.findOne({ 
        where: { 
          name: cropData.name,
        } 
      });
      
      if (!crop) {
        crop = cropRepository.create(cropData);
        await cropRepository.save(crop);
      }
      
      crops.push(crop);
    }
    
    return crops;
  }
}

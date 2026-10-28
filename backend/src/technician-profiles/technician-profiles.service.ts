import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TechnicianProfile } from './entities/technician-profile.entity';
import { CreateTechnicianProfileDto } from './dto/create-technician-profile.dto';
import { UpdateTechnicianProfileDto } from './dto/update-technician-profile.dto';
import { User } from '../users/entities/user.entity';
import { ServiceCategory } from '../service-categories/entities/service-category.entity';

@Injectable()
export class TechnicianProfilesService {
  constructor(
    @InjectRepository(TechnicianProfile)
    private readonly repo: Repository<TechnicianProfile>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(ServiceCategory)
    private readonly categoriesRepo: Repository<ServiceCategory>,
  ) {}

  async create(dto: CreateTechnicianProfileDto): Promise<TechnicianProfile> {
    const user = await this.usersRepo.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${dto.userId} no encontrado`);
    }

    const categorias = await this.categoriesRepo.find({
      where: { id: In(dto.categoriaIds) },
    });

    const profile = this.repo.create({
      userId: dto.userId,
      dni: dto.dni,
      direccion: dto.direccion,
      radioCoberturaKm: dto.radioCoberturaKm ?? 5,
      categorias,
    });

    // Asignamos la ubicación geoespacial aparte, ya que TypeORM
    // no tipa bien las funciones SQL crudas dentro de repo.create()
    (profile as any).ubicacion = () =>
      `ST_SetSRID(ST_MakePoint(${dto.longitud}, ${dto.latitud}), 4326)`;

    return this.repo.save(profile);
  }

  findAll() {
    return this.repo.find({ relations: { user: true, categorias: true } });
  }

  async findOne(id: string) {
    const profile = await this.repo.findOne({
      where: { id },
      relations: { user: true, categorias: true },
    });
    if (!profile) {
      throw new NotFoundException(`Perfil de técnico con id ${id} no encontrado`);
    }
    return profile;
  }

  async findNearby(latitud: number, longitud: number, categoriaId?: string) {
  const query = this.repo
    .createQueryBuilder('profile')
    .leftJoinAndSelect('profile.user', 'user')
    .leftJoinAndSelect('profile.categorias', 'categoria')
    .addSelect(
      `ST_Distance(
        profile.ubicacion,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
      )`,
      'distancia_metros',
    )
    .where(
      `ST_DWithin(
        profile.ubicacion,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
        profile.radio_cobertura_km * 1000
      )`,
    )
    .setParameters({ lat: latitud, lng: longitud })
    .orderBy('distancia_metros', 'ASC');

  if (categoriaId) {
    query.andWhere('categoria.id = :categoriaId', { categoriaId });
  }

  const { entities, raw } = await query.getRawAndEntities();

  // Combinamos cada perfil con su distancia calculada
  return entities.map((profile, index) => ({
    ...profile,
    distanciaKm: Number(raw[index].distancia_metros) / 1000,
  }));
}

  async update(id: string, dto: UpdateTechnicianProfileDto) {
  const profile = await this.findOne(id);

  const {
    categoriaIds,
    latitud,
    longitud,
    calificacionPromedio, // campo del sistema: se ignora si alguien lo manda
    userId, // la relacion con el usuario no se cambia por PATCH
    ...rest
  } = dto as any;

  Object.assign(profile, rest);

  if (categoriaIds) {
    const categorias = await this.categoriesRepo.find({
      where: { id: In(categoriaIds) },
    });
    profile.categorias = categorias;
  }

  if (latitud !== undefined && longitud !== undefined) {
    (profile as any).ubicacion = () =>
      `ST_SetSRID(ST_MakePoint(${longitud}, ${latitud}), 4326)`;
  }

  return this.repo.save(profile);
}

  async remove(id: string) {
    const profile = await this.findOne(id);
    await this.repo.remove(profile);
  }
}
import {
  Licitacion,
  CreateLicitacionDto,
  LicitacionesFilterOptions,
} from '../types/licitacion.types';

// Mock data inicial
let MOCK_LICITACIONES: Licitacion[] = [
  {
    id: 'lic-001',
    codigo: 'LIC-2026-001',
    titulo: 'Adquisición de Equipamiento Médico y Quirúrgico de Alta Especialidad',
    descripcion: 'Compra consolidada de tomógrafos y monitores de signos vitales para red hospitalaria regional.',
    entidad: 'Secretaría de Salud / Hospital Metropolitano',
    categoria: 'Salud',
    estado: 'publicada',
    presupuestoEstimado: 14500000,
    moneda: 'MXN',
    fechaPublicacion: '2026-10-15',
    fechaCierre: '2026-11-20',
    propuestasCount: 6,
    documentosCount: 8,
  },
  {
    id: 'lic-002',
    codigo: 'LIC-2026-002',
    titulo: 'Renovación de Infraestructura Cloud y Ciberseguridad Institucional',
    descripcion: 'Servicios gestionados de nube híbrida, firewall perimetral y soporte 24/7.',
    entidad: 'Dirección General de Innovación y Tecnologías',
    categoria: 'Tecnología',
    estado: 'en_evaluacion',
    presupuestoEstimado: 8900000,
    moneda: 'MXN',
    fechaPublicacion: '2026-09-01',
    fechaCierre: '2026-10-31',
    propuestasCount: 4,
    documentosCount: 12,
  },
  {
    id: 'lic-003',
    codigo: 'LIC-2026-003',
    titulo: 'Mantenimiento Preventivo y Correctivo de Edificios Administrativos',
    descripcion: 'Pintura, impermeabilización y adecuaciones eléctricas en 4 inmuebles públicos.',
    entidad: 'Secretaría de Obras Públicas',
    categoria: 'Infraestructura',
    estado: 'adjudicada',
    presupuestoEstimado: 3200000,
    moneda: 'MXN',
    fechaPublicacion: '2026-08-10',
    fechaCierre: '2026-09-15',
    propuestasCount: 9,
    documentosCount: 5,
  },
  {
    id: 'lic-004',
    codigo: 'LIC-2026-004',
    titulo: 'Suministro de Reactivos de Laboratorio y Pruebas Rápidas Diagnósticas',
    descripcion: 'Dotación semestral de insumos clínicos para centros de salud comunitarios.',
    entidad: 'Instituto de Salud Pública',
    categoria: 'Salud',
    estado: 'borrador',
    presupuestoEstimado: 4100000,
    moneda: 'MXN',
    fechaPublicacion: '2026-11-01',
    fechaCierre: '2026-12-15',
    propuestasCount: 0,
    documentosCount: 3,
  },
];

export const licitacionesService = {
  async getAll(filters?: LicitacionesFilterOptions): Promise<Licitacion[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    let result = [...MOCK_LICITACIONES];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.titulo.toLowerCase().includes(q) ||
          l.codigo.toLowerCase().includes(q) ||
          l.entidad.toLowerCase().includes(q)
      );
    }

    if (filters?.estado && filters.estado !== 'todas') {
      result = result.filter((l) => l.estado === filters.estado);
    }

    if (filters?.categoria && filters.categoria !== 'todas') {
      result = result.filter((l) => l.categoria === filters.categoria);
    }

    return result;
  },

  async getById(id: string): Promise<Licitacion | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_LICITACIONES.find((l) => l.id === id) || null;
  },

  async create(dto: CreateLicitacionDto): Promise<Licitacion> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const nextIdNumber = MOCK_LICITACIONES.length + 1;
    const padded = String(nextIdNumber).padStart(3, '0');

    const nuevaLicitacion: Licitacion = {
      id: `lic-${padded}`,
      codigo: `LIC-2026-${padded}`,
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      entidad: dto.entidad,
      categoria: dto.categoria,
      presupuestoEstimado: dto.presupuestoEstimado,
      moneda: dto.moneda,
      fechaPublicacion: new Date().toISOString().split('T')[0],
      fechaCierre: dto.fechaCierre,
      estado: 'borrador',
      propuestasCount: 0,
      documentosCount: 1,
    };

    MOCK_LICITACIONES = [nuevaLicitacion, ...MOCK_LICITACIONES];
    return nuevaLicitacion;
  },
};


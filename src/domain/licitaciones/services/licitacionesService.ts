import { apiClient } from '@/lib/apiClient';
import {
  Licitacion,
  CreateLicitacionDto,
  LicitacionesFilterOptions,
  LicitacionProject,
  LicitacionOrder,
  LicitacionPending,
  LicitacionProduct,
  ProductsFetchParams,
  ProductsFetchResult,
} from '../types/licitacion.types';

const MOCK_PRODUCTS_CATALOG: LicitacionProduct[] = [
  {
    id: 'prod-01',
    code: 'MED-OXI-01',
    name: 'Oxímetro de Pulso Digital Grado Médico',
    stock: 120,
    amount: 1850,
    providerName: 'Masimo México',
    categoryName: 'Monitoreo',
    brandName: 'Masimo',
    unit: 'Pza',
    description: 'Sensor pediátrico y adulto con alarma SpO2 continua.',
  },
  {
    id: 'prod-02',
    code: 'MED-EST-02',
    name: 'Estetoscopio Clínico Cardiológico Acero Inoxidable',
    stock: 95,
    amount: 3200,
    providerName: 'Littmann México',
    categoryName: 'Diagnóstico',
    brandName: '3M Littmann',
    unit: 'Pza',
    description: 'Doble campana sintonizable de alta sensibilidad acústica.',
  },
  {
    id: 'prod-03',
    code: 'MED-ESF-03',
    name: 'Esfigmomanómetro Aneroide de Pared para Consultorio',
    stock: 80,
    amount: 2450,
    providerName: 'Welch Allyn de México',
    categoryName: 'Diagnóstico',
    brandName: 'Welch Allyn',
    unit: 'Pza',
    description: 'Carátula graduada de alta visibilidad con brazalete lavable.',
  },
  {
    id: 'prod-04',
    code: 'MED-BOM-04',
    name: 'Bomba de Infusión Volumétrica Unicanal',
    stock: 60,
    amount: 42000,
    providerName: 'B. Braun Medical',
    categoryName: 'Terapia Intensiva',
    brandName: 'B. Braun',
    unit: 'Pza',
    description: 'Control de flujo volumétrico micro y macro con detección de aire.',
  },
  {
    id: 'prod-05',
    code: 'MED-MON-02',
    name: 'Monitor de Signos Vitales Modular 5 Parámetros',
    stock: 45,
    amount: 85000,
    providerName: 'Mindray Medical México',
    categoryName: 'Monitoreo',
    brandName: 'Mindray',
    unit: 'Pza',
    description: 'ECG, SpO2, PNI, Temp, Resp con pantalla táctil de 12.1".',
  },
  {
    id: 'prod-06',
    code: 'MED-ECG-06',
    name: 'Electrocardiógrafo Digital de 12 Derivaciones',
    stock: 35,
    amount: 58000,
    providerName: 'Schiller México',
    categoryName: 'Cardiología',
    brandName: 'Schiller',
    unit: 'Pza',
    description: 'Impresión térmica integrada y exportación digital PDF/DICOM.',
  },
  {
    id: 'prod-07',
    code: 'MED-LAM-07',
    name: 'Lámpara Quirúrgica de Techo LED Bifocal',
    stock: 28,
    amount: 145000,
    providerName: 'Dräger México',
    categoryName: 'Quirófano',
    brandName: 'Dräger',
    unit: 'Pza',
    description: '160,000 lux con temperatura de color ajustable sin sombras.',
  },
  {
    id: 'prod-08',
    code: 'MED-MES-08',
    name: 'Mesa de Cirugía Electrohidráulica Multidisciplinaria',
    stock: 22,
    amount: 320000,
    providerName: 'Stryker México',
    categoryName: 'Quirófano',
    brandName: 'Stryker',
    unit: 'Pza',
    description: 'Capacidad de 250 kg con radiotransparencia para arco en C.',
  },
  {
    id: 'prod-09',
    code: 'MED-DEF-04',
    name: 'Desfibrilador Bifásico con Marcapasos Externo',
    stock: 18,
    amount: 165000,
    providerName: 'Zoll Medical',
    categoryName: 'Urgencias',
    brandName: 'Zoll',
    unit: 'Pza',
    description: 'Reanimación avanzada con retroalimentación de RCP en tiempo real.',
  },
  {
    id: 'prod-10',
    code: 'MED-AUT-10',
    name: 'Autoclave de Vapor de Alta Capacidad 60 Litros',
    stock: 15,
    amount: 98000,
    providerName: 'Tuttnauer México',
    categoryName: 'Esterilización',
    brandName: 'Tuttnauer',
    unit: 'Pza',
    description: 'Ciclos de secado al vacío con cámara de acero inoxidable 316L.',
  },
  {
    id: 'prod-11',
    code: 'TEC-SRV-03',
    name: 'Servidor Rack 2U Enterprise para Ciberseguridad',
    stock: 12,
    amount: 240000,
    providerName: 'Dell Technologies',
    categoryName: 'Tecnología',
    brandName: 'Dell',
    unit: 'Pza',
    description: 'Dual Xeon Gold, 128GB RAM, 8TB SSD NVMe para entornos críticos.',
  },
  {
    id: 'prod-12',
    code: 'MED-ULT-12',
    name: 'Ultrasonido Portátil Doppler Color Multidisciplinario',
    stock: 10,
    amount: 380000,
    providerName: 'GE Healthcare México',
    categoryName: 'Imagenología',
    brandName: 'General Electric',
    unit: 'Pza',
    description: 'Transductores convexo, lineal y endocavitario con elastografía.',
  },
  {
    id: 'prod-13',
    code: 'MED-CUN-13',
    name: 'Cuna Térmica de Calor Radiante Servocontrolada',
    stock: 8,
    amount: 195000,
    providerName: 'Medix Neonatal',
    categoryName: 'Neonatología',
    brandName: 'Medix',
    unit: 'Pza',
    description: 'Fototerapia LED integrada y báscula electrónica para neonatos.',
  },
  {
    id: 'prod-14',
    code: 'MED-INC-14',
    name: 'Incubadora Neonatal de Terapia Intensiva',
    stock: 7,
    amount: 420000,
    providerName: 'Atom Medical',
    categoryName: 'Neonatología',
    brandName: 'Atom',
    unit: 'Pza',
    description: 'Control de humedad, temperatura y concentración de oxígeno.',
  },
  {
    id: 'prod-15',
    code: 'MED-ELC-15',
    name: 'Unidad de Electrocirugía Alta Frecuencia 400W',
    stock: 6,
    amount: 175000,
    providerName: 'Medtronic México',
    categoryName: 'Quirófano',
    brandName: 'Valleylab / Medtronic',
    unit: 'Pza',
    description: 'Corte puro, coagulación fulgurante y sellado vascular avanzado.',
  },
  {
    id: 'prod-16',
    code: 'MED-LAP-16',
    name: 'Torre de Laparoscopía de Ultra Alta Definición 4K',
    stock: 5,
    amount: 1450000,
    providerName: 'Karl Storz México',
    categoryName: 'Quirófano',
    brandName: 'Karl Storz',
    unit: 'Pza',
    description: 'Cámara 4K, insuflador térmico de 50L y fuente de luz fría LED.',
  },
  {
    id: 'prod-17',
    code: 'MED-MAS-17',
    name: 'Mastógrafo Digital de Campo Completo 3D Tomosíntesis',
    stock: 4,
    amount: 3800000,
    providerName: 'Hologic México',
    categoryName: 'Imagenología',
    brandName: 'Hologic',
    unit: 'Pza',
    description: 'Detección temprana con compresión inteligente y menor dosis de radiación.',
  },
  {
    id: 'prod-18',
    code: 'MED-TOMO-01',
    name: 'Tomógrafo Computarizado Multicorte 64 Cortes',
    stock: 3,
    amount: 6500000,
    providerName: 'Siemens Healthineers / Distribución',
    categoryName: 'Imagenología',
    brandName: 'Siemens',
    unit: 'Pza',
    description: 'Equipo de diagnóstico por imagenología de alta resolución y reconstrucción 3D.',
  },
  {
    id: 'prod-19',
    code: 'MED-RAY-19',
    name: 'Equipo de Rayos X Móvil Digital con Detector Inalámbrico',
    stock: 3,
    amount: 1250000,
    providerName: 'Philips Healthcare',
    categoryName: 'Imagenología',
    brandName: 'Philips',
    unit: 'Pza',
    description: 'Generador de 32 kW para toma de placas en piso y urgencias.',
  },
  {
    id: 'prod-20',
    code: 'MED-ANG-20',
    name: 'Arco en C Quirúrgico Móvil Fluoroscópico 3D',
    stock: 2,
    amount: 2850000,
    providerName: 'Ziehm Imaging México',
    categoryName: 'Quirófano',
    brandName: 'Ziehm',
    unit: 'Pza',
    description: 'Panel plano de alta resolución para cirugía vascular y ortopédica.',
  },
  {
    id: 'prod-21',
    code: 'MED-RES-21',
    name: 'Resonador Magnético 1.5 Tesla Superconductor de Túnel Corto',
    stock: 1,
    amount: 14500000,
    providerName: 'Canon Medical Systems',
    categoryName: 'Alta Especialidad',
    brandName: 'Canon Medical',
    unit: 'Pza',
    description: 'Bobinas multicanal y reducción de ruido acústico para pacientes claustrofóbicos.',
  },
  {
    id: 'prod-22',
    code: 'MED-LIN-22',
    name: 'Acelerador Lineal Clínico para Radioterapia Externa',
    stock: 1,
    amount: 28000000,
    providerName: 'Elekta México',
    categoryName: 'Oncología',
    brandName: 'Elekta',
    unit: 'Pza',
    description: 'Radioterapia guiada por imagen (IGRT) y volumétrica modulada (VMAT).',
  },
];

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
];

export const licitacionesService = {
  // Licitaciones base
  async getAll(filters?: LicitacionesFilterOptions): Promise<Licitacion[]> {
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

  async create(dto: CreateLicitacionDto): Promise<Licitacion> {
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

  // 1. Proyectos de Licitaciones (/oportunities/refactor)
  async getProjects(): Promise<LicitacionProject[]> {
    try {
      const params = {
        limit: 20,
        count: 1,
      };
      const response = await apiClient.get('/oportunities/refactor', { params });
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data.map((item: any) => ({
          id: item.id || item._id,
          folio: item.folio || `PRJ-${item.id?.substring(0, 5)}`,
          name: item.name || item.oportunity?.name || 'Proyecto de Licitación',
          prospectName: item.prospect?.name || item.oportunity?.prospect?.name || 'Entidad Pública',
          phaseName: item.phase?.name || 'Revisión de Bases',
          amount: item.amount || item.total || 0,
          expectedDate: item.expected_close_date || item.createdAt?.split('T')[0],
          assignedTo: item.prospect?.ejecutive?.name || 'Responsable Licitaciones',
        }));
      }
    } catch {
      // Fallback con datos representativos de crm-jobs
    }

    return [
      {
        id: 'prj-101',
        folio: 'LIC-ISSSTE-01',
        name: 'Suministro Consolidado de Insumos Médicos ISSSTE 2026',
        prospectName: 'ISSSTE Central',
        phaseName: 'Revisión de Bases',
        amount: 5400000,
        expectedDate: '2026-11-28',
        assignedTo: 'Carlos Méndez',
      },
      {
        id: 'prj-102',
        folio: 'LIC-IMSS-02',
        name: 'Mantenimiento de Equipo Radiológico Hospital General',
        prospectName: 'IMSS Bienestar',
        phaseName: 'Propuesta Técnica',
        amount: 3200000,
        expectedDate: '2026-11-22',
        assignedTo: 'Valeria Robles',
      },
      {
        id: 'prj-103',
        folio: 'LIC-SEDENA-03',
        name: 'Equipamiento de Quirófanos y Torres de Laparoscopía',
        prospectName: 'SEDENA Hospital Militar',
        phaseName: 'Fallo y Dictamen',
        amount: 12800000,
        expectedDate: '2026-11-15',
        assignedTo: 'Ing. Rodrigo Lara',
      },
      {
        id: 'prj-104',
        folio: 'LIC-SSA-04',
        name: 'Dotación de Monitores de Signos Vitales y Desfibriladores',
        prospectName: 'Secretaría de Salud CDMX',
        phaseName: 'Adjudicada',
        amount: 8100000,
        expectedDate: '2026-11-10',
        assignedTo: 'GABL Licitaciones',
      },
    ];
  },

  // 2. Órdenes / Pedidos (/orders)
  async getOrders(): Promise<LicitacionOrder[]> {
    try {
      const response = await apiClient.get('/orders', {
        params: { limit: 10, count: 1 },
      });
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data.map((item: any) => ({
          id: item.id || item._id,
          folio: item.folio || `ORD-${item.id?.substring(0, 6)}`,
          total: item.total || 0,
          status: item.orderstatus?.name || 'Recibido',
          prospectName: item.oportunity?.prospect?.name || 'Cliente Institucional',
          createdAt: item.createdAt ? item.createdAt.split('T')[0] : '2026-11-01',
          exitstatus: item.exitstatus || 'En proceso',
        }));
      }
    } catch {
      // Fallback
    }

    return [
      {
        id: 'ord-01',
        folio: 'PED-2026-0091',
        total: 1250000,
        status: 'Aprobado',
        prospectName: 'Hospital Metropolitano',
        createdAt: '2026-11-05',
        exitstatus: 'Surtido',
      },
      {
        id: 'ord-02',
        folio: 'PED-2026-0092',
        total: 840000,
        status: 'Pendiente',
        prospectName: 'Clínica Regional No. 12',
        createdAt: '2026-11-06',
        exitstatus: 'En almacén',
      },
    ];
  },

  // 3. Pendientes y Calendario (/pendings)
  async getPendings(): Promise<LicitacionPending[]> {
    try {
      const response = await apiClient.get('/pendings', {
        params: { count: 1, limit: 15 },
      });
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data.map((p: any) => ({
          id: p.id || p._id,
          subject: p.subject || 'Entrega de Pliegos',
          description: p.description || '',
          date_from: p.date_from ? p.date_from.split('T')[0] : '2026-11-12',
          priority: p.priority || 'alta',
          isdone: Boolean(p.isdone),
        }));
      }
    } catch {
      // Fallback
    }

    return [
      {
        id: 'pen-1',
        subject: 'Cierre de aclaraciones - Licitación ISSSTE',
        description: 'Junta de aclaraciones presencial sala 4',
        date_from: '2026-11-12',
        priority: 'alta',
        isdone: false,
      },
      {
        id: 'pen-2',
        subject: 'Presentación de sobre técnico - IMSS Bienestar',
        description: 'Carga de ficha técnica y certificados ISO',
        date_from: '2026-11-15',
        priority: 'alta',
        isdone: false,
      },
      {
        id: 'pen-3',
        subject: 'Revisión de fianza de cumplimiento',
        description: 'Revisar póliza con afianzadora',
        date_from: '2026-11-18',
        priority: 'media',
        isdone: false,
      },
    ];
  },

  // 4. Catálogo de Productos (/products) con soporte para skip (page), limit: 20, order (-stock), categoría y búsqueda
  async getProducts(params?: ProductsFetchParams): Promise<ProductsFetchResult> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const orderBy = params?.orderBy ?? '-stock';
    const search = params?.search?.trim() ?? '';
    const category = params?.category?.trim() ?? '';

    let query: Record<string, any> = {
      isactive: true,
    };

    if (search.length > 0) {
      query.$or = [
        { code: { $iRegexp: search } },
        { name: { $iRegexp: search } },
      ];
    }

    if (category && category !== 'todas') {
      query['category.name'] = category;
    }

    try {
      const response = await apiClient.get('/products', {
        params: {
          include: 'category,brand,provider',
          limit,
          skip: page,
          count: 1,
          order: orderBy,
          where: JSON.stringify(query),
        },
        skipGlobalErrorAlert: true,
      });

      // El backend Limenka retorna en response.data.results y el conteo en count
      const results =
        response.data?.results ||
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : null);

      const totalCount =
        response.data?.count ??
        response.data?.total ??
        (Array.isArray(results) ? results.length : 0);

      if (Array.isArray(results) && results.length > 0) {
        const normalized: LicitacionProduct[] = results.map((prod: any) => ({
          id: String(prod.id || prod._id || ''),
          code: prod.code || 'SKU-000',
          name: prod.name || 'Producto Médico / Tecnológico',
          stock: Math.max(0, Number(prod.stock) || 0),
          stockapart: Math.max(0, Number(prod.stockapart) || 0),
          stockassigned: Math.max(0, Number(prod.stockassigned) || 0),
          stockrepair: Math.max(0, Number(prod.stockrepair) || 0),
          amount: Number(prod.callamount || prod.amount || prod.storeamount || 0),
          providerName: prod.provider?.name || prod.provider?.companyname || 'Limenka / Proveedor',
          categoryName: prod.category?.name || 'Insumo Hospitalario',
          brandName: prod.brand?.name || 'Genérico',
          unit: prod.unit || 'Pza',
          description: prod.description || '',
        }));

        return { results: normalized, total: totalCount };
      }
    } catch {
      // Fallback a catálogo local enriquecido si el servicio dev está offline
    }

    // Filtrar catálogo local
    let filtered = [...MOCK_PRODUCTS_CATALOG];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.code.toLowerCase().includes(s)
      );
    }

    if (category && category !== 'todas') {
      filtered = filtered.filter(
        (p) => p.categoryName?.toLowerCase() === category.toLowerCase()
      );
    }

    // Ordenar localmente según orderBy
    if (orderBy === '-stock') {
      filtered.sort((a, b) => b.stock - a.stock);
    } else if (orderBy === 'stock') {
      filtered.sort((a, b) => a.stock - b.stock);
    } else if (orderBy === '-amount') {
      filtered.sort((a, b) => b.amount - a.amount);
    } else if (orderBy === 'amount') {
      filtered.sort((a, b) => a.amount - b.amount);
    } else if (orderBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (orderBy === '-name') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginatedResults = filtered.slice(startIndex, startIndex + limit);

    return { results: paginatedResults, total };
  },
};

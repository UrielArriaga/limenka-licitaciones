import React from 'react';
import Head from 'next/head';
import { DashboardLayout } from '@/shared/components/DashboardLayout';
import { ActivitiesBoardView } from '@/shared/features/ActivitiesBoard';

export default function LicitacionesTablerosPage() {
  return (
    <DashboardLayout
      title="Panel de Actividades de Licitaciones"
      allowedRoles={['admin', 'licitaciones', 'licitador']}
    >
      <Head>
        <title>Panel de Actividades | Limenka Licitaciones</title>
      </Head>

      <ActivitiesBoardView
        basePath="/licitaciones/tableros"
        title="Panel de Actividades y Tableros"
        subtitle="Gestión colaborativa de actividades, pliegos, requisitos y fechas de entrega"
      />
    </DashboardLayout>
  );
}

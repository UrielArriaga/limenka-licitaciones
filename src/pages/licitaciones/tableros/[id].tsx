import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/shared/components/DashboardLayout';
import { BoardDetailView } from '@/shared/features/ActivitiesBoard';

export default function LicitacionTableroDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!router.isReady || !id || typeof id !== 'string') {
    return (
      <DashboardLayout
        title="Cargando tablero..."
        allowedRoles={['admin', 'licitaciones', 'licitador']}
      >
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Tablero de Actividades"
      allowedRoles={['admin', 'licitaciones', 'licitador']}
    >
      <Head>
        <title>Tablero de Actividades | Limenka Licitaciones</title>
      </Head>

      <BoardDetailView
        boardId={id}
        basePath="/licitaciones/tableros"
      />
    </DashboardLayout>
  );
}


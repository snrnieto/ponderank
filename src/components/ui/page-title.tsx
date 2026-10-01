import Head from 'expo-router/head';

import { APP_NAME } from '@/constants/brand';

/**
 * Título de la pestaña del navegador (solo web). Las partes se unen de la más específica a la
 * más general y siempre termina con el nombre de la app: "Esquema · Vehículos · Ponderank".
 */
export function PageTitle({ parts = [] }: { parts?: (string | null | undefined)[] }) {
  const title = [...parts.filter((p): p is string => !!p && p.trim() !== ''), APP_NAME].join(' · ');
  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
}

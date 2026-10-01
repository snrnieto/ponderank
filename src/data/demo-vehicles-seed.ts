import type { ComparisonListBundle, Item, ListColumn, ListGlobal } from '@/domain';
import { createId } from './lists-repository';

/** Demo data for the "Vehículos usados" list. */
export function buildDemoVehiclesBundle(): ComparisonListBundle {
  const listId = 'list_demo_vehicles';
  const now = '2026-07-24T00:00:00.000Z';

  const globals: ListGlobal[] = [
    {
      id: 'g_galon',
      listId,
      key: 'precio_galon',
      label: 'Precio galón',
      value: 16500,
    },
    {
      id: 'g_piendamo',
      listId,
      key: 'km_piendamo',
      label: 'Km Piendamo',
      value: 240,
    },
    {
      id: 'g_dia',
      listId,
      key: 'km_dia_normal',
      label: 'Km día normal',
      value: 40,
    },
  ];

  const columns: ListColumn[] = [
    { id: 'c_image', listId, name: 'Imagen', kind: 'image', order: 0 },
    { id: 'c_name', listId, name: 'Nombre', kind: 'text', order: 1 },
    {
      id: 'c_tipo',
      listId,
      name: 'Tipo',
      kind: 'category',
      options: ['Gasolina', 'Hibrido gasolina'],
      order: 2,
    },
    { id: 'c_precio', listId, name: 'Precio', kind: 'number', order: 3 },
    { id: 'c_puestos', listId, name: 'Puestos', kind: 'number', order: 4 },
    { id: 'c_consumo', listId, name: 'Km por galón', kind: 'number', order: 5 },
    {
      id: 'c_precio_pasajero',
      listId,
      name: 'Precio por pasajero',
      kind: 'criterion',
      order: 6,
      calc: { op: 'div', leftRef: 'column:c_precio', rightRef: 'column:c_puestos' },
      rank: {
        weight: 20,
        direction: 'lowerBetter',
        target: { mode: 'min' },
      },
    },
    {
      id: 'c_precio_km',
      listId,
      name: 'Precio por km',
      kind: 'criterion',
      order: 7,
      calc: { op: 'globalDivCol', leftRef: 'global:g_galon', rightRef: 'column:c_consumo' },
      rank: {
        weight: 50,
        direction: 'lowerBetter',
        target: { mode: 'custom', customValue: 250 },
      },
    },
    {
      id: 'c_accel',
      listId,
      name: '0-100',
      kind: 'criterion',
      order: 8,
      rank: {
        weight: 30,
        direction: 'lowerBetter',
        target: { mode: 'custom', customValue: 11 },
      },
    },
    {
      id: 'c_piendamo',
      listId,
      name: 'Piendamo',
      kind: 'calculated',
      order: 9,
      calc: { op: 'colMulGlobal', leftRef: 'column:c_precio_km', rightRef: 'global:g_piendamo' },
    },
    {
      id: 'c_dia',
      listId,
      name: 'Día normal',
      kind: 'calculated',
      order: 10,
      calc: { op: 'colMulGlobal', leftRef: 'column:c_precio_km', rightRef: 'global:g_dia' },
    },
  ];

  const rows: {
    name: string;
    tipo: string;
    precio: number;
    puestos: number;
    consumo: number;
    accel: number;
    image: string;
  }[] = [
    {
      name: 'Suzuki Swift 1.2 GLX Hybrid',
      tipo: 'Hibrido gasolina',
      precio: 70_000_000,
      puestos: 4.5,
      consumo: 70,
      accel: 12.5,
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQesuvJ_alyVxUq6XZxCDx47gZid3dpMYOL-zuh3cxMpoQdyy65QlbvXvo&s=10',
    },
    {
      name: 'Chevrolet Onix ONIX LT TURBO 1.0 AUT',
      tipo: 'Gasolina',
      precio: 68_000_000,
      puestos: 5,
      consumo: 50,
      accel: 9.9,
      image: 'https://http2.mlstatic.com/D_NQ_NP_881277-MCO112264131338_062026-O.webp',
    },
    {
      name: 'Volkswagen Polo 1.0 Highline At6',
      tipo: 'Gasolina',
      precio: 72_500_000,
      puestos: 4.5,
      consumo: 50,
      accel: 10.5,
      image: 'https://http2.mlstatic.com/D_NQ_NP_639324-MCO113667563297_062026-O.webp',
    },
    {
      name: 'Nissan Versa 1.6 Advance Cvt',
      tipo: 'Gasolina',
      precio: 78_000_000,
      puestos: 5,
      consumo: 48,
      accel: 10.5,
      image:
        'https://autosdeprimera.com/wp-content/uploads/2026/06/nissan-versa-2027-lanzamiento-barranquilla-portada.jpg',
    },
    {
      name: 'Suzuki Fronx 1.5 GLX AT Hybrid',
      tipo: 'Hibrido gasolina',
      precio: 90_000_000,
      puestos: 5,
      consumo: 50,
      accel: 11,
      image:
        'https://suzukiderco.vteximg.com.br/arquivos/ids/156725-1000-1000/Fronx-azul.png?v=638344571176000000',
    },
    {
      name: 'Hyundai Hb20 1.6 Advance Aut',
      tipo: 'Gasolina',
      precio: 73_000_000,
      puestos: 5,
      consumo: 50,
      accel: 13.2,
      image: 'https://http2.mlstatic.com/D_NQ_NP_664737-MCO112856435973_062026-O.webp',
    },
    {
      name: 'Mazda Mazda 2 1.5 Touring At',
      tipo: 'Gasolina',
      precio: 78_000_000,
      puestos: 5,
      consumo: 45,
      accel: 11.5,
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCB5m0asOeOshLDAruocVGkeLKinS5Cu69cs8no2XYWeg5KODhRkJPDhTK&s=10',
    },
    {
      name: 'Kia Picanto 1.2 Zenith At',
      tipo: 'Gasolina',
      precio: 66_000_000,
      puestos: 4.5,
      consumo: 50,
      accel: 14.5,
      image: 'https://http2.mlstatic.com/D_NQ_NP_665362-MCO112167906924_062026-O.webp',
    },
    {
      name: 'Renault Logan 1.6 Intens Aut',
      tipo: 'Gasolina',
      precio: 69_000_000,
      puestos: 5,
      consumo: 38,
      accel: 11.7,
      image:
        'https://acroadtrip.blob.core.windows.net/catalogo-imagenes/s/RT_V_447038ee44054a94bbb98abf339d13d3.jpg',
    },
    {
      name: 'Kia Soluto 1.4 Emotion At',
      tipo: 'Gasolina',
      precio: 68_000_000,
      puestos: 5,
      consumo: 38,
      accel: 13,
      image: 'https://http2.mlstatic.com/D_NQ_NP_639324-MCO113667563297_062026-O.webp',
    },
  ];

  const items: Item[] = rows.map((row) => ({
    id: createId('item'),
    listId,
    createdAt: now,
    values: {
      c_image: row.image,
      c_name: row.name,
      c_tipo: row.tipo,
      c_precio: row.precio,
      c_puestos: row.puestos,
      c_consumo: row.consumo,
      c_accel: row.accel,
    },
  }));

  return {
    list: {
      id: listId,
      name: 'Vehículos usados',
      createdAt: now,
      updatedAt: now,
    },
    globals,
    columns,
    items,
  };
}

/** La lista demo solo se carga si se activa explícitamente (útil en desarrollo). */
export function isDemoSeedEnabled(): boolean {
  return process.env.EXPO_PUBLIC_ENABLE_DEMO_SEED === 'true';
}

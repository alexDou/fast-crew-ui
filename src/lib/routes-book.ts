export const routesBook = {
  main: '/',
  signin: '/signin',
  signup: '/signup',
  dashboard: '/dashboard',
  tuner: 'tuner'
} as const;

export const routesPublic = {
  main: '/',
  signin: '/signin',
  signup: '/signup',
} as const;

export const routesPrivate = {
  main: '/dashboard',
  tuner: '/tuner'
} as const;


export type RoutesPublicValuesType = typeof routesPublic[keyof typeof routesPublic];
export type RoutesPrivateValuesType = typeof routesPrivate[keyof typeof routesPrivate];

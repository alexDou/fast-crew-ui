export const routesBook = {
  main: "/",
  signin: "/signin",
  signup: "/signup",
  dashboard: "/dashboard",
  tuner: "tuner",
  poems: "/poems",
  poemDetail: (id: number | string) => `/poems/${id}`
} as const;

export const routesPublic = {
  main: "/",
  signin: "/signin",
  signup: "/signup"
} as const;

export const routesPrivate = {
  main: "/dashboard",
  tuner: "/tuner",
  poems: "/poems"
} as const;

export type RoutesPublicValuesType = (typeof routesPublic)[keyof typeof routesPublic];
export type RoutesPrivateValuesType = (typeof routesPrivate)[keyof typeof routesPrivate];

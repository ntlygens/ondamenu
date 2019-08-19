export enum AppStateType {
  INTRO = 'intro' as any,
  MERCHANT = 'merchant' as any,
  USER = 'user' as any,
  CLIENT = 'client' as any,
}

export interface AppRouteInterface {
  title?: string;
  redirectTo?: string;
  loadChildren?: string;
  pathMatch?: string;
  path: string;
  component?: any;
  children?: any;
  outlets?: any;
  outlet?: string;
  formType?: AppStateType;
}

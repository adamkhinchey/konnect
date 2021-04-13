import {environment} from "../../../environments/environment";

export function devLogger(method: string, data: any): void {
  if (environment.env === 'dev' || environment.env === 'development') {
    // @ts-ignore
    console[method](data);
  }

}

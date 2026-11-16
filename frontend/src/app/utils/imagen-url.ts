import { environment } from '../../environments/environment';

export function urlImagenProducto(imagen?: string | null): string | undefined {
  if (!imagen) return undefined;
  if (/^https?:\/\//i.test(imagen)) return imagen;

  const origenApi = environment.apiUrl.replace(/\/api\/?$/, '');
  return `${origenApi}${imagen.startsWith('/') ? '' : '/'}${imagen}`;
}

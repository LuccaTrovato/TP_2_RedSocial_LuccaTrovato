import { HttpInterceptorFn } from '@angular/common/http';

const SESSION_KEY = 'red-social-session';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const rawSession = localStorage.getItem(SESSION_KEY);
  if (!rawSession) return next(request);

  const session = JSON.parse(rawSession) as { access_token: string };
  return next(
    request.clone({
      setHeaders: { Authorization: `Bearer ${session.access_token}` },
    }),
  );
};

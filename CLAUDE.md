# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Group Tours is a React-based travel package management system built with TypeScript and Vite. The application handles tour packages, reservations, hotels, destinations, and includes comprehensive user management with role-based permissions.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production (runs TypeScript compiler and Vite build)
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Environment Configuration

The project uses environment-specific configuration files:
- `.env.development` - Development environment (default: http://127.0.0.1:8000/api)
- `.env.test` - Test environment

Required environment variables:
- `VITE_API_BASE_URL` - Backend API base URL
- `VITE_ENV` - Environment identifier

## Architecture

### State Management

The application uses **Zustand** for global state management:

- **`sessionStore`** (`src/store/sessionStore.tsx`): Manages authentication, user session, roles, and permissions
  - Stores session in localStorage
  - Provides permission checking methods: `siTienePermiso(modulo, tipo)` and `hasRole(role)`
  - Admin users bypass permission checks

- **`navigationStore`** (`src/store/navigationStore.ts`): Handles navigation state and redirects

- **`useFacturaFormStore`** (`src/store/useFacturaFormStore.ts`): Invoice form state management

### HTTP Layer

All API calls go through a centralized Axios instance with interceptors:

- **`axiosInstance`** (`src/service/axiosInterceptor.ts`):
  - Automatically appends trailing slashes to URLs
  - Injects Bearer token for authenticated requests (except login)
  - Handles FormData for paquete endpoints (multipart/form-data)
  - Intercepts 401 errors to trigger logout and redirect
  - Shows toast notifications for errors

- **HTTP service pattern**: Each domain module has its own `http*.ts` file in `src/components/utils/`:
  - `httpPaquete.ts`, `httpHotel.ts`, `httpDestino.ts`, `httpReservas.ts`, etc.
  - Pattern: `fetchData()` for paginated lists with filters, `nuevoDataFetch()` for create, `guardarDataEditado()` for update, `activarDesactivarData()` for soft delete

### Routing & Protection

Three-layer routing structure defined in `src/router/AppRouter.tsx`:

1. **ProtectedRoute**: Checks if user has valid session, redirects to `/login` if not
2. **PermissionRoute**: Verifies user has "leer" (read) permission for the module based on URL path
3. **MainLayout**: Wraps authenticated pages with sidebar/navbar

Routes are organized by modules:
- `/paquetes_viajes/*` - Packages, destinations, hotels, reservations
- `/seguridad/*` - Security: users, roles, permissions, persons, employees
- `/configuracion/*` - Configuration: invoicing, modules, document types, nationalities

### Data Fetching

Uses **TanStack Query (React Query)** for server state management:
- `QueryClient` configured in `src/components/utils/http.ts`
- Handles caching, background refetching, and loading states

### Toast Notifications

Custom toast system with context API:
- **ToastContext** (`src/context/ToastContext.tsx`): Provides `handleShowToast` function
- **ToastContainer** (`src/components/ToastContainer.tsx`): Renders toast notifications
- **toastService** (`src/helper/toastService.ts`): Allows showing toasts from outside React tree (e.g., interceptors)

### UI Components

Uses **Radix UI** primitives with custom styling:
- Component library in `src/components/ui/` (shadcn-style components)
- Tailwind CSS 4.x for styling
- Path alias `@/` maps to `src/`

### Form Patterns

Common reusable components:
- **DinamicSearchSelect**: Dynamic searchable select with filtering
- **GenericSearchSelect**: Generic searchable select component
- **CountrySearchSelect**: Country-specific search select
- **FechaSalidaSelectorContainer**: Date departure selector

## Code Patterns

### Permission Checks

Always check permissions before rendering UI or enabling actions:

```typescript
const { siTienePermiso } = useSessionStore();
const canCreate = siTienePermiso('moduleName', 'crear');
const canModify = siTienePermiso('moduleName', 'modificar');
const canDelete = siTienePermiso('moduleName', 'eliminar');
```

Module names in `siTienePermiso()` should be lowercase and match the URL segment.

### API Service Functions

When creating new API services, follow this pattern:

```typescript
// Paginated list with filters
export const fetchData = async (page: number, page_size: number = 5, filtros: any) => {
  let url = `/endpoint/?page=${page}&page_size=${page_size}`;
  // Add filter parameters...
  const resp = await axiosInstance.get(url);
  return resp?.data ?? null;
}

// Create
export async function nuevoDataFetch(data: any) {
  await axiosInstance.post(`/endpoint/`, data);
}

// Update
export async function guardarDataEditado({ data, id }: { data: any; id: number | string }) {
  await axiosInstance.put(`/endpoint/${id}/`, data);
}

// Soft delete/activate
export async function activarDesactivarData({ dataId, activo }: { dataId: number; activo: boolean }) {
  await axiosInstance.patch(`/endpoint/${dataId}/`, { activo });
}
```

### Lazy Loading

All pages are lazy-loaded in `AppRouter.tsx`:

```typescript
const ModulePage = lazy(() => import('@/pages/ModulePage'));
```

## Important Notes

- **Trailing slashes**: The backend requires trailing slashes on all endpoints - the interceptor handles this automatically
- **FormData handling**: For paquete endpoints, use FormData for multipart uploads - Content-Type header is automatically removed
- **Admin bypass**: Users with `esAdmin: true` automatically pass all permission checks
- **Session initialization**: `initializeSession()` is called on app mount to restore session from localStorage
- **401 handling**: Token expiration triggers automatic logout and redirect to login after 2.5s delay with toast notification

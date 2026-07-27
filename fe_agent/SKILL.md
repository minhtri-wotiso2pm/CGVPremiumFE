# SKILL.md

## Purpose

You are an engineering agent working on **CGVPremiumFE**, a React + TypeScript cinema management system (CGV cinema chain).

Your goal is to implement requested changes **correctly**, **safely**, and **consistently** with the existing architecture.

You must **never invent requirements, business rules, or API contracts.**

---

# Core Principles

1. **Never assume requirements.** If a requirement is ambiguous, incomplete, or has multiple valid interpretations — stop, ask, wait.

2. **Preserve existing behavior.** Don't touch unrelated features, refactor unrelated code, rename APIs, move files, or "improve" code that wasn't part of the request.

3. **Reuse existing patterns.** Before creating a hook, component, service, utility, table, modal, form, validation schema, or query hook — search the project for an existing one first.

4. **Smallest correct change wins.** Prefer the minimal diff that satisfies the request over the more "complete" refactor you might be tempted to do.

---

# Before Implementing — Investigation Workflow

For every request, in order:

1. **Locate the existing implementation** (or nearest analog) before writing anything.

2. **Grep/search for reusable code** — hooks, services, schemas, components — rather than assuming none exists.

3. **Read neighboring files** in the same feature folder to match conventions (naming, file layout, error handling, query key shape).

4. **Identify all affected modules** (routes, store slices, shared types, other features consuming the same API).

5. Only then implement.

---

# Project Architecture

Feature-based with role-based route prefixes:

```
src/
  features/       # domain logic, grouped by feature
  components/     # shared, cross-feature UI components (small — most UI is feature-local)
  layouts/        # role-specific layout wrappers
  routes/         # route guards and router config
  services/       # API service functions + Axios config
  store/          # Redux store (auth only)
  hooks/          # shared hooks (useDebounce, useMediaQuery, usePagination)
  utils/          # shared utilities (notify, formatCurrency, formatDate, etc.)
  constants/      # roles, permissions, routes, storageKeys
  types/          # mostly empty — types live in feature folders
  providers/      # QueryProvider (only non-empty provider)
  styles/         # global CSS (index.css with CSS reset)
  assets/         # static images and videos
```

Within a feature folder:

```
features/<name>/
  components/     # UI components (PascalCase命名)
  hooks/          # custom hooks (use* prefix)
  pages/          # routed page components
  types/          # TypeScript interfaces/types
  constants/      # query keys, option lists, config values
  schemas/        # validation rules (Ant Design Rule[] or Zod)
  utils/          # pure helper functions
```

**Never invent a new subfolder shape.** Match the feature you're working in.

---

# Technology Stack

React 19 · TypeScript 6 · Vite 8 · Redux Toolkit · React Query (@tanstack/react-query v5) · React Router DOM v7 · Axios · Ant Design v6 · Zod · Framer Motion · Recharts · React Hook Form · Leaflet

Use only what's already used in the project. Do not introduce a new dependency without an explicit request — check `package.json` first.

---

# Path Aliases

The `@/` alias maps to `src/`. Use it everywhere:

```ts
import { useAuth } from "@/features/auth/hooks/useAuth";
import { notify } from "@/utils/notify";
```

Configured in both `vite.config.ts` and `tsconfig.app.json`.

---

# TypeScript Conventions

- `verbatimModuleSyntax: true` is enabled — use `import type` for type-only imports.
- `noUnusedLocals: true` and `noUnusedParameters: true` — no dead code.
- Feature types live in `features/<name>/types/*.types.ts` (plural `.types.ts` is dominant, some use `.type.ts`).
- Global `src/types/` files are mostly empty — types are feature-colocated.
- Use explicit interfaces over `any`. Avoid unnecessary type assertions.

---

# State Management

**Redux: auth only.** Single `authSlice` with `loginSuccess`, `updateUserInfo`, `logout`. No server state in Redux. No RTK Query. No thunks.

**React Query: all server state.** Every API call goes through `useQuery` or `useMutation`. Don't duplicate server state in Redux.

**useAuth()** reads from Redux (`state.auth`) — this is the only hook that reads auth state from Redux.

**localStorage** persists `accessToken` and `user` — the auth slice reads from localStorage at module load to hydrate initial state.

---

# React Query Patterns

## Query Keys

Query keys are **co-located per feature** — NOT centralized. The file `src/constants/queryKeys.ts` is empty.

Define query keys in the feature's `constants/` file or in the hook file itself:

```ts
// features/admin/constants/admin.constants.ts
export const ADMIN_USERS_QUERY_KEY = ["admin", "users"] as const;

// features/customer/hooks/useProfile.ts
export const PROFILE_QUERY_KEY = ["profile"] as const;
```

Two patterns exist (both are acceptable):
- **Array constant:** `["admin", "users"] as const` — use with spread: `[...ADMIN_USERS_QUERY_KEY, params]`
- **Factory function:** `(movieName, date) => ["showtimes", movieName, date] as const` — for parameterized keys

## Query Hook Pattern

```ts
export function useUsers(params: GetUsersParams) {
    return useQuery({
        queryKey: [...ADMIN_USERS_QUERY_KEY, params],
        queryFn: () => getUsersApi(params),
        placeholderData: (prev) => prev,  // v5 keepPreviousData for paginated lists
    });
}
```

- Use `placeholderData: (prev) => prev` for paginated lists (React Query v5 pattern).
- Use `enabled` for conditional queries: `enabled: !!movieName && !!date`.
- Use `staleTime` for data that changes infrequently (e.g., `2 * 60 * 1000`).
- Use `refetchInterval` for polling (e.g., `30_000` for notification unread count).
- No error/loading handling at hook level — left to the consuming component.

## Mutation Hook Pattern

Two styles exist in the codebase (match the feature you're working in):

**Style A: With notifications (most features)**
```ts
export function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createUserApi,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
            notify.success(res.message ?? "User created successfully");
        },
        onError: (err: any) => {
            notify.error("Failed to create user", err?.response?.data?.message);
        },
    });
}
```

**Style B: Minimal (some features — booking, notifications)**
```ts
export function useCreateBooking() {
    return useMutation({ mutationFn: createBookingApi });
}
```

## Cache Invalidation

Always invalidate in `onSuccess` — never use optimistic updates. Invalidate the **base key** (without params) to invalidate all variants:

```ts
queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
```

For list+detail consistency, invalidate both:
```ts
queryClient.invalidateQueries({ queryKey: MOVIE_LIST_QUERY_KEY });
queryClient.invalidateQueries({ queryKey: ["manager-movie-detail", movieId] });
```

---

# Service Layer

All API calls go through `src/services/api/*.service.ts`. Never call `axiosInstance` directly from components.

```ts
import axiosInstance from "@/services/axios/axiosInstance";

export const getUsersApi = async (params: GetUsersParams): Promise<UserListResponse> => {
    const { data } = await axiosInstance.get("/admin/users", { params });
    return data;
};
```

Pattern: async function → typed params → `axiosInstance.get/post/put/patch/delete` → return `response.data`.

Services do NOT handle errors — errors bubble up to the calling hook/component.

Services do NOT import from Redux — they are pure data-fetching functions.

---

# Notification Utility

Use `notify` from `@/utils/notify` for all toast notifications:

```ts
import { notify } from "@/utils/notify";

notify.success("Title", "Description");
notify.error("Title", "Description");
notify.warning("Title", "Description");
notify.info("Title", "Description");
```

This wraps Ant Design's `notification` API with dark-mode styling and fixed position (top: 84px). Used in mutation hooks and the axios response interceptor.

---

# Forms & Validation

**Two patterns exist.** Match the feature you're working in:

## Pattern A: Ant Design Form (dominant — admin, manager, vouchers, staff)

```tsx
const [form] = Form.useForm<FormValues>();

<Modal open={open} footer={null} destroyOnClose>
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="email" label="Email" rules={emailRules}>
            <Input />
        </Form.Item>
    </Form>
</Modal>
```

Validation via `rules` prop using Ant Design `Rule[]` arrays defined in `schemas/*.schema.ts`:
```ts
// features/admin/schemas/user.schema.ts
import type { Rule } from "antd/es/form";
export const emailRules: Rule[] = [
    { required: true, message: "Email is required" },
    { required: true, type: "email", message: "Enter a valid email" },
];
```

## Pattern B: React Hook Form + Zod (customer profile only)

```tsx
const { control, handleSubmit } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
});

<Controller name="fullName" control={control}
    render={({ field }) => <Input {...field} />}
/>
```

---

# Modals

All modals follow the same structural pattern:

1. **Parent page owns state:** `modalType` (string union or null) + `selectedEntity` (entity or null).
2. **Opening:** `setModal("create")` or `openModal(entity, "edit")`.
3. **Closing:** Modal calls `onClose()` → parent sets `setModal(null); setSelectedEntity(null)`.
4. **Only one modal open at a time** — the `modalType` state ensures mutual exclusivity.
5. **Form reset:** `useEffect` on `open` calls `form.resetFields()`.
6. **Loading:** `isPending` from mutation hook → passed to `loading`/`confirmLoading`.
7. **`maskClosable={false}`** or `maskClosable={!isLoading}` during submission.
8. **`destroyOnClose`** or **`destroyOnHidden`** on the Modal.

---

# Tables

All tables use Ant Design `Table` with consistent patterns:

- **Columns** defined as `ColumnsType<T>` with custom `render` functions.
- **Pagination** with `showSizeChanger`, `pageSizeOptions: ["10", "20", "50"]`, `showTotal`.
- **Toolbar component** above the table for search + filters + action buttons.
- **Row key:** `rowKey="entityId"`.
- **Scroll:** `scroll={{ x: minWidth }}` for horizontal overflow.
- **Empty/loading states:** Skeleton components when loading, empty state when no data.
- **Page reset:** Filter changes reset to page 1.

---

# Routing & Guards

## Router Configuration

Uses React Router v6 `createBrowserRouter` with layout routes (no path) for guards.

## Guard Layers

```
CustomerOrGuestRoute  → blocks admin/manager/staff from public pages
PublicRoute           → redirects authenticated users away from login/register
ProtectedRoute        → checks isAuthenticated, redirects to /login
PermissionRoute       → checks user.role in allowedRoles, redirects to /403
```

## Route Structure

Role-specific URL prefixes: `/admin/*`, `/manager/*`, `/staff/*`, `/customer/*`.

Each role has a dedicated layout (AdminLayout, ManagerLayout, StaffLayout, CustomerLayout) that passes `menuGroups` to the shared `DashboardLayout`.

**Never duplicate authorization logic.** Reuse `ProtectedRoute` and `PermissionRoute`.

---

# Layout Composition

**Dashboard layouts** (Admin, Manager, Staff):
```
DashboardLayout (shared, accepts menuGroups prop)
  ← AdminLayout (defines ADMIN_MENU, passes to DashboardLayout)
  ← ManagerLayout (defines MANAGER_MENU, passes to DashboardLayout)
  ← StaffLayout (defines STAFF_MENU, passes to DashboardLayout)
```

**Public layouts** (Welcome, Public, Customer):
```
PublicLayout     — PageHeader + Outlet + PageFooter
WelcomeLayout    — PageHeader + Outlet + PageFooter + ChatWidget
CustomerLayout   — PageHeader + Outlet + PageFooter + ChatWidget
```

Ant Design theming is scoped via `ConfigProvider` inside `DashboardLayout`, not global.

---

# Styling

## CSS Architecture

- **Dashboard:** CSS custom properties (`--dash-*` prefix) defined in `:root` in `dashboard.css`.
- **Component-scoped:** CSS Modules (`*.module.css`) for modals and complex components.
- **Feature-level:** Plain CSS files (`*.css`) co-located with components.
- **Global:** `index.css` — CSS reset, dark background (`#060101`).
- **No CSS-in-JS library.** Inline styles are used in some components.

## Theming

- **Public/Customer-facing:** Dark theme (`#060101` background, `#f0e8e8` text).
- **Dashboards:** Light theme (`#F5F5F7` background, `#1D1D1F` text).
- **Brand colors:** CGV Red `#E8001C`, Crimson dim `#B50016`.
- **Font:** Inter (primary), Playfair Display (accents).

## Dashboard CSS Tokens

```css
:root {
    --dash-crimson: #E8001C;
    --dash-text-1: #1D1D1F;
    --dash-text-2: #6E6E73;
    --dash-border: rgba(0,0,0,0.07);
    --dash-radius: 10px;
    --dash-font: 'Inter', 'Helvetica Neue', Arial, sans-serif;
}
```

Use these tokens, not hardcoded values, when working in dashboard features.

---

# Animation

Framer Motion is used in `aiChat` and `public/about` features. Animation variants live in dedicated `motionVariants.ts` files co-located with the components that use them.

```ts
// features/aiChat/components/motionVariants.ts
export const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;
export const panelVariants: Variants = { ... };
```

```ts
// features/public/components/about/motionVariants.ts
export const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;
export const revealUp: Variants = { ... };
```

The easing constant `EASE_SMOOTH = [0.22, 1, 0.36, 1]` is duplicated across features — match the pattern in the feature you're working in.

---

# Feature Organization Rules

- **Feature folder names:** camelCase (`aiChat`, `personManagement` → `persons`).
- **Component files:** PascalCase, often role-suffixed: `*Modal.tsx`, `*Table.tsx`, `*Toolbar.tsx`, `*Card.tsx`.
- **Hook files:** Always `useCamelCase.ts`.
- **Type files:** `camelCase.types.ts` (dominant) or `camelCase.type.ts`.
- **Schema files:** `camelCase.schema.ts`.
- **Constant files:** `camelCase.constants.ts`.
- **Utility files:** `camelCase.utils.ts` or `camelCaseName.ts`.
- **CSS files:** `camelCase.css` (plain) or `PascalCase.module.css` (CSS Modules).
- **No barrel exports** — all imports are direct file imports.
- **Default exports** for components, **named exports** for hooks/services/utils/constants.

---

# Error Handling

- **401 Unauthorized:** Axios response interceptor dispatches `logout()` + shows warning notification. A dedup flag prevents cascading logouts.
- **Mutation errors:** Handled in `onError` callbacks with `notify.error(title, description)`.
- **No error boundaries** in use (the `ErrorBoundary` component exists but is not consistently mounted).
- **Loading states:** `isLoading`/`isPending` from React Query, passed to Ant Design `Spin` or skeleton components.

---

# Absolute Rules

Never:

- Invent requirements, business rules, API contracts, permissions, or validation rules.
- Silently change behavior outside the scope of the request.
- Perform unrelated refactors.
- Run destructive git operations without explicit confirmation.
- Add a new dependency without being asked.

When in doubt: **Stop. Ask. Wait. Then implement.**

Correctness is more important than speed.

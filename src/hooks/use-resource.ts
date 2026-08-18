import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import {
  createResourceFn,
  deleteResourceFn,
  getResourceFn,
  listResourceFn,
  updateResourceFn,
  type Row,
} from "@/lib/admin.functions";
import type { ResourceKey } from "@/lib/application/resources";

export interface ResourceListOptions {
  search?: string;
  filters?: Record<string, string | number | boolean | null>;
  page?: number;
  pageSize?: number;
  sort?: { column: string; ascending: boolean };
  enabled?: boolean;
}

export interface ResourceListResult<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

const clean = (filters?: Record<string, string | number | boolean | null>) => {
  if (!filters) return undefined;
  const out: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined || value === "" || value === "all") continue;
    out[key] = value;
  }
  return Object.keys(out).length ? out : undefined;
};

/** Server-side paginated, searched and filtered list for any registered resource. */
export function useResourceList<T = Row>(resource: ResourceKey, options: ResourceListOptions = {}) {
  const list = useServerFn(listResourceFn);
  const { enabled = true, search, filters, page = 1, pageSize = 25, sort } = options;
  const params = {
    resource,
    ...(search?.trim() ? { search: search.trim() } : {}),
    ...(clean(filters) ? { filters: clean(filters)! } : {}),
    page,
    pageSize,
    ...(sort ? { sort } : {}),
  };

  const query = useQuery({
    queryKey: ["resource", resource, params],
    queryFn: () => list({ data: params }) as Promise<ResourceListResult<T>>,
    enabled,
    placeholderData: (previous) => previous,
  });

  return {
    ...query,
    rows: (query.data?.rows ?? []) as T[],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? page,
    pageSize: query.data?.pageSize ?? pageSize,
    pageCount: Math.max(1, Math.ceil((query.data?.total ?? 0) / (query.data?.pageSize ?? pageSize))),
  };
}

/** Single record by primary key. */
export function useResourceRecord<T = Row>(resource: ResourceKey, id: string | undefined) {
  const get = useServerFn(getResourceFn);
  return useQuery({
    queryKey: ["resource", resource, "record", id],
    queryFn: () => get({ data: { resource, id: id! } }) as Promise<T>,
    enabled: Boolean(id),
  });
}

/** Create / update / delete with cache invalidation and user feedback. */
export function useResourceMutations(resource: ResourceKey) {
  const queryClient = useQueryClient();
  const create = useServerFn(createResourceFn);
  const update = useServerFn(updateResourceFn);
  const remove = useServerFn(deleteResourceFn);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["resource", resource] });
  const onError = (error: unknown) =>
    toast.error(error instanceof Error ? error.message : "Something went wrong.");

  return {
    create: useMutation({
      mutationFn: (values: Record<string, unknown>) => create({ data: { resource, values } }),
      onSuccess: () => {
        void invalidate();
        toast.success("Record created.");
      },
      onError,
    }),
    update: useMutation({
      mutationFn: (input: { id: string; values: Record<string, unknown> }) =>
        update({ data: { resource, id: input.id, values: input.values } }),
      onSuccess: () => {
        void invalidate();
        toast.success("Changes saved.");
      },
      onError,
    }),
    remove: useMutation({
      mutationFn: (id: string) => remove({ data: { resource, id } }),
      onSuccess: () => {
        void invalidate();
        toast.success("Record deleted.");
      },
      onError,
    }),
  };
}

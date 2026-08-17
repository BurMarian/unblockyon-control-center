import type { SupabaseClient } from "@supabase/supabase-js";

import type { Db } from "../context";
import { fromDatabaseError, notFound } from "../errors";
import { primaryKeyOf, type ResourceDefinition } from "../resources";

/**
 * The registry addresses tables by name at runtime, so repositories talk to an
 * untyped view of the client. Typing happens at the service/DTO boundary.
 */
type UntypedDb = SupabaseClient<any, "public", any>;
const untyped = (db: Db): UntypedDb => db as unknown as UntypedDb;

export interface ListParams {
  search?: string | undefined;
  filters?: Record<string, string | number | boolean | null> | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
  sort?: { column: string; ascending: boolean } | undefined;
}

export interface ListResult<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Server-side paginated, filtered, sorted reads. Never selects `*`, never
 * fetches an unbounded result set. RLS still applies — the client is scoped
 * to the caller.
 */
export async function listRecords<T>(
  db: Db,
  def: ResourceDefinition,
  resourceKey: string,
  params: ListParams,
): Promise<ListResult<T>> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 25));
  const from = (page - 1) * pageSize;

  let query = untyped(db)
    .from(def.table)
    .select(def.select, { count: "exact" })
    .range(from, from + pageSize - 1);

  const sortColumn = params.sort?.column ?? def.orderBy.column;
  const ascending = params.sort?.ascending ?? def.orderBy.ascending;
  query = query.order(sortColumn, { ascending });

  const search = params.search?.trim();
  if (search && def.searchColumns.length > 0) {
    const escaped = search.replace(/[%,()]/g, " ");
    query = query.or(def.searchColumns.map((c) => `${c}.ilike.%${escaped}%`).join(","));
  }

  for (const [column, value] of Object.entries(params.filters ?? {})) {
    if (value === null || value === undefined || value === "") continue;
    if (!def.filterColumns.includes(column)) continue;
    query = query.eq(column, value);
  }

  const { data, error, count } = await query;
  if (error) throw fromDatabaseError(error);
  void resourceKey;
  return { rows: (data ?? []) as T[], total: count ?? 0, page, pageSize };
}

export async function getRecord<T>(
  db: Db,
  def: ResourceDefinition,
  resourceKey: string,
  id: string,
): Promise<T> {
  const { data, error } = await untyped(db)
    .from(def.table)
    .select(def.select)
    .eq(primaryKeyOf(resourceKey), id)
    .maybeSingle();
  if (error) throw fromDatabaseError(error);
  if (!data) throw notFound();
  return data as T;
}

export async function insertRecord<T>(db: Db, def: ResourceDefinition, values: Record<string, unknown>): Promise<T> {
  const { data, error } = await untyped(db).from(def.table).insert(values).select(def.select).single();
  if (error) throw fromDatabaseError(error);
  return data as T;
}

export async function updateRecord<T>(
  db: Db,
  def: ResourceDefinition,
  resourceKey: string,
  id: string,
  values: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await untyped(db)
    .from(def.table)
    .update(values)
    .eq(primaryKeyOf(resourceKey), id)
    .select(def.select)
    .maybeSingle();
  if (error) throw fromDatabaseError(error);
  if (!data) throw notFound();
  return data as T;
}

export async function deleteRecord(db: Db, def: ResourceDefinition, resourceKey: string, id: string): Promise<void> {
  const { error, count } = await untyped(db)
    .from(def.table)
    .delete({ count: "exact" })
    .eq(primaryKeyOf(resourceKey), id);
  if (error) throw fromDatabaseError(error);
  if (!count) throw notFound();
}

export async function countRecords(
  db: Db,
  table: string,
  build?: (q: any) => any,
): Promise<number> {
  let query = untyped(db).from(table).select("*", { count: "exact", head: true });
  if (build) query = build(query);
  const { count, error } = await query;
  if (error) throw fromDatabaseError(error);
  return count ?? 0;
}

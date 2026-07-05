import { createServerFn } from "@tanstack/react-start";
import {
  fetchAllGroups,
  fetchGroupBySlug,
  fetchGroupDetail,
  fetchProgrammeStats,
} from "@/lib/data/groups";

export const getGroups = createServerFn({ method: "GET" }).handler(async () => fetchAllGroups());

export const getGroup = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null || !("slug" in data)) {
      throw new Error("slug is required");
    }
    return { slug: String((data as { slug: string }).slug) };
  })
  .handler(async ({ data }) => fetchGroupBySlug(data.slug));

export const getGroupDetail = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null || !("slug" in data)) {
      throw new Error("slug is required");
    }
    return { slug: String((data as { slug: string }).slug) };
  })
  .handler(async ({ data }) => fetchGroupDetail(data.slug));

export const getProgrammeStats = createServerFn({ method: "GET" }).handler(async () =>
  fetchProgrammeStats(),
);

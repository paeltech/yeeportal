import { createServerFn } from "@tanstack/react-start";
import {
  fetchAllGroups,
  fetchApplyFormOptions,
  fetchGroupBySlug,
  fetchGroupDetail,
  fetchHomePageData,
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

export const getHomePageData = createServerFn({ method: "GET" }).handler(async () =>
  fetchHomePageData(),
);

export const getApplyFormOptions = createServerFn({ method: "GET" }).handler(async () =>
  fetchApplyFormOptions(),
);

export const getPublishedStories = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchPublishedStories } = await import("@/lib/data/stories");
  return fetchPublishedStories();
});

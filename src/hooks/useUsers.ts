import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/query-keys";

import { get } from "@/lib/api";

import { UserType } from "@/types";

export function useUsers() {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS],
    queryFn: ({ signal }) => get<UserType[]>("/users", { signal }),
    select: (data) => data.slice(0, 5)
  });
}

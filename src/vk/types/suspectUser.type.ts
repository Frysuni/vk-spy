import type { UsersUser1, UsersUserFull1 } from "vk-io/lib/api/schemas/objects";

export type SuspectUserType = UsersUserFull1 & UsersUser1 & BaseUser;

type BaseUser = {
  id: number
  track_code: string
  first_name: string
  last_name: string
  can_access_closed: boolean
  is_closed: boolean
};
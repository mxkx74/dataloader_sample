import { placeholderHandlers } from "@/models/resources/placeholder/mock";
import { postHandlers } from "@/models/resources/post/mock";
import { userHandlers } from "@/models/resources/user/mock";

export const handlers = [...placeholderHandlers, ...postHandlers, ...userHandlers];

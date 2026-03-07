import { placeholderHandlers } from "@/models/resources/placeholder/mock";
import { postHandlers } from "@/models/resources/post/mock";

export const handlers = [...placeholderHandlers, ...postHandlers];

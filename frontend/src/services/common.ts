import { controlledKeys } from "../constents";

class CommonService {
  keyDownConvertor(keyDown: KeyboardEvent): string {
    const key = keyDown.key;

    if (!controlledKeys.includes(key)) return key;

    if (keyDown.ctrlKey) return `ctrl-${key}`;
    if (keyDown.shiftKey) return `shift-${key}`;

    return key;
  }
}

export const commonService = new CommonService();

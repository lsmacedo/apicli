import { prompt } from 'enquirer';

type PromptType = 'autocomplete' | 'form';

type PromptParam = {
  name: string;
  defaultValue?: string;
  optional?: boolean;
  disabled?: boolean;
};

type Prompt = {
  message: string;
  choices?: (
    | string
    | {
        name: string;
        initial?: string;
        disabled?: boolean | string;
        validate?: (val: string) => boolean | string;
      }
  )[];
  validate?: (val: never) => boolean | string;
};

export const askForOption = (message: string, options: string[]) => {
  return buildPrompt<string>('autocomplete', {
    message,
    choices: options,
  });
};

export const askForParams = async (message: string, params: PromptParam[]) => {
  if (!params.some((param) => !param.disabled)) {
    return {};
  }
  return buildPrompt<Record<string, string>>('form', {
    message,
    choices: params.map((param) => ({
      name: param.name,
      initial: param.defaultValue,
      disabled: param.disabled ? 'Hidden' : false,
      validate: (val) => validateFormParam(val, param),
    })),
    validate: (val) => validateForm(val, params),
  });
};

const buildPrompt = async <T>(promptType: PromptType, opts: Prompt) => {
  return (
    await prompt<{ response: T }>({
      type: promptType,
      message: opts.message,
      name: 'response',
      choices: opts.choices,
      stdout: process.stderr,
      validate: opts.validate,
    })
  ).response;
};

const validateForm = (val: Record<string, string>, params: PromptParam[]) => {
  const hasInvalidParam = params.some(
    (param) => !validateFormParam(val[param.name], param)
  );
  return hasInvalidParam ? 'Fill all required fields before submitting' : true;
};

const validateFormParam = (val: string, option: PromptParam) => {
  if (option.optional || option.disabled) {
    return true;
  }
  return Boolean(val.trim());
};

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
  validate?: (val: string | Record<string, string>) => boolean | string;
};

export const askForOption = (message: string, options: string[]) => {
  return buildPrompt<string>('autocomplete', {
    message,
    choices: options,
  });
};

export const askForParams = (message: string, options: PromptParam[]) => {
  return buildPrompt<Record<string, string>>('form', {
    message,
    choices: options.map((option) => ({
      name: option.name,
      initial: option.defaultValue,
      disabled: option.disabled ? 'Hidden' : false,
      validate: option.optional ? undefined : (val) => !!val.trim(),
    })),
    validate: (val) => {
      if (typeof val === 'string') {
        return false;
      }
      const isMissingRequiredParam = options.some(
        (option) => !option.optional && !val[option.name].trim()
      );
      return isMissingRequiredParam
        ? 'Fill all required fields before submitting'
        : true;
    },
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

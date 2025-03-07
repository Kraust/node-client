import { NVIM_SYNC, NVIM_SPEC, NVIM_METHOD_NAME } from './properties';

export interface AutocmdOptions {
  pattern: string;
  // eslint-disable-next-line no-eval
  eval?: string;
  sync?: boolean;
}

// Example
// @autocmd('BufEnter', { pattern: '*.js', eval: 'expand("<afile>")', sync: true })
export function autocmd(name: string, options?: AutocmdOptions) {
  return function (cls: any, methodName: string | null) {
    // const {
    // sync,
    // ...opts,
    // } = options;

    const sync = options && !!options.sync;
    const isMethod = typeof methodName === 'string';
    const f = isMethod ? cls[methodName] : cls;
    const opts: AutocmdOptions = {
      pattern: '',
    };

    ['pattern', 'eval'].forEach((option: keyof AutocmdOptions) => {
      if (options && typeof options[option] !== 'undefined') {
        (opts[option] as any) = options[option];
      }
    });

    const nameWithPattern = `${name}${
      options.pattern ? `:${options.pattern}` : ''
    }`;
    Object.defineProperty(f, NVIM_METHOD_NAME, {
      value: `autocmd:${nameWithPattern}`,
    });
    Object.defineProperty(f, NVIM_SYNC, { value: !!sync });
    Object.defineProperty(f, NVIM_SPEC, {
      value: {
        type: 'autocmd',
        name,
        sync: !!sync,
        opts,
      },
    });

    if (isMethod) {
      // eslint-disable-next-line no-param-reassign
      cls[methodName] = f;
    }

    return cls;
  };
}

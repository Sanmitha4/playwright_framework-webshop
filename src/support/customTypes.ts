
import { defineParameterType } from '@cucumber/cucumber';

defineParameterType({
  name: 'list',
  regexp: /"([^"]+?)"/,
  transformer: (input: string) => input.replace(/^\[|\]$/g, '').split(',').map(item => item.trim())
});

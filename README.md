# obj-err

[![npm version](https://img.shields.io/npm/v/obj-err.svg)](https://www.npmjs.com/package/obj-err)
[![License](https://img.shields.io/npm/l/obj-err.svg)](https://github.com/Harineko0/obj-err/blob/main/LICENSE)
[![Actions Status](https://github.com/Harineko0/obj-err/workflows/CI/badge.svg)](https://github.com/Harineko0/obj-err/actions)

Common object error library specifically for functional typescript.

## Installation

Using npm:

```bash
npm install obj-err
```

Or using yarn:

```bash
yarn add obj-err
```

## Usage

### Define a Custom Error

```typescript
import { errorBuilder, InferError } from 'obj-err';

// Define an error for each specific case
export const NotFounderror = errorBuidler('NotFoundError');
export type NotFounderror = InferError<typeof NotFounderror>;

// Another error with additional properties
export const InputTooShortError = errorBuilder('InputTooShortError', {
  id: 'string',
  requiredLength: 123,
  actualLength: 123,
});
export type InputTooShortError = InferError<typeof InputTooShortError>;

// You can use zod schema for extra properties
import { z } from 'zod';

export const AnotherError = errorBuilder(
  'AnotherError',
  z.object({
    reason: z.string(),
    code: z.number(),
  })
);
export type AnotherError = InferError<typeof AnotherError>;
```

### Throwing the Custom Error (e.g. using neverthrow)

```typescript
export const validateString = (
  input: string
): Result<string, InputTooShortError> => {
  if (input.length < 5) {
    return err(
      InputTooShortError('Input is too short', {
        cause: new Error('Validation failed'), // Store the original error
        extra: {
          details: 'The input must be at least 5 characters long.',
          requiredLength: 5,
          actualLength: input.length,
        },
      })
    );
  }
  return ok(input);
};
```

### Handling the Custom Error (e.g. using ts-pattern)

```typescript
const handleError = (
  error: InputTooShortError | NotFounderror | AnotherError
) =>
  match(error)
    .with(InputTooShortError.is, () => StatusCode.BadRequest)
    .with(NotFounderror.is, () => StatusCode.NotFound)
    .with(AnotherError.is, () => StatusCode.InternalServerError)
    .exhaustive();
```

## Contributing

Contributions, issues, and feature requests are welcome! Please see `CONTRIBUTING.md` for details.

To get started with development, fork the repository and run the following commands:

```bash
git clone https://github.com/Harineko0/obj-err.git
cd obj-err
npm install
```

## License

This project is licensed under the **MIT License**.

---

Copyright © 2025 [Harineko0](https://github.com/Harineko0).<br />
This project is [MIT](https://github.com/Harineko0/obj-err/blob/main/LICENSE) licensed.

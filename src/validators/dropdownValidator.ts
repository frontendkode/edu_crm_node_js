import { z } from 'zod';

export const createDropdownSchema = z.object({
  dropdownType: z
    .string({ required_error: 'Dropdown type is required.' })
    .min(1, 'Dropdown type must not be empty.'),
  values: z
    .array(z.string().min(1, 'Dropdown values must not be empty.'))
    .min(1, 'At least one dropdown value is required.'),
});

export const updateDropdownSchema = z.object({
  id: z.string().optional(),
  dropdownType: z
    .string({ required_error: 'Dropdown type is required.' })
    .min(1, 'Dropdown type must not be empty.'),
  values: z
    .array(z.string().min(1, 'Dropdown values must not be empty.'))
    .min(1, 'At least one dropdown value is required.'),
});

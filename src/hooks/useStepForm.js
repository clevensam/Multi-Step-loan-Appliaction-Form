import { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import getSchema from '../schemas/schemaFactory';

export default function useStepForm(defaultValues) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const stepIdxRef = useRef(0);

  stepIdxRef.current = currentStepIdx;

  const resolveSchema = useCallback(async (values) => {
    const idx = stepIdxRef.current;
    const withVerified = { ...values, panVerified: !!(values.panNumber && values.panNumber.length === 10) };
    const schema = getSchema(idx, withVerified);
    if (!schema) return { values, errors: {} };
    const result = schema.safeParse(values);
    if (result.success) return { values, errors: {} };
    const errors = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      if (path && !errors[path]) {
        errors[path] = { type: 'validation', message: issue.message };
      }
    });
    return { values: {}, errors };
  }, []);

  const methods = useForm({
    defaultValues,
    resolver: resolveSchema,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    shouldFocusError: false,
  });

  return { ...methods, currentStepIdx, setCurrentStepIdx };
}

import step1Schema from './step1Schema';
import step2Schema from './step2Schema';
import step3Schema from './step3Schema';
import step4Schema from './step4Schema';

export default function getSchema(stepIndex, formState = {}) {
  switch (stepIndex) {
    case 0:
      return step1Schema(formState);
    case 1:
      return step2Schema(formState);
    case 2:
      return step3Schema(formState);
    case 3:
      return step4Schema(formState);
    default:
      return null;
  }
}

import step1Schema from './step1Schema';
import step2Schema from './step2Schema';
import step3Schema from './step3Schema';
import step4Schema from './step4Schema';
import step5Schema from './step5Schema';
import step6Schema from './step6Schema';
import step7Schema from './step7Schema';
import step8Schema from './step8Schema';

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
    case 4:
      return step5Schema(formState);
    case 5:
      return step6Schema(formState);
    case 6:
      return step7Schema(formState);
    case 7:
      return step8Schema(formState);
    default:
      return null;
  }
}

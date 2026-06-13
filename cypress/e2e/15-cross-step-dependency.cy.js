import personalLoan from '../fixtures/personal-loan.json';
import businessLoan from '../fixtures/business-loan.json';

describe('Cross-Step Validation Dependencies', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('changes loan type after Step 5 and updates dependent steps', () => {
    cy.fillStep1({
      loanType: 'Personal',
      loanAmount: '500000',
      loanTenure: '36',
      loanPurpose: 'debt-consolidation',
    });
    cy.goToNextStep();
    cy.fillStep2({
      fullName: 'Test User',
      dateOfBirth: '1990-06-15',
      gender: 'Male',
      maritalStatus: 'Single',
      fatherName: 'Father Name',
      motherName: 'Mother Name',
      email: 'test@example.com',
      mobile: '9876543210',
    });
    cy.goToNextStep();
    cy.wait(1600);
    cy.fillStep3({
      panNumber: 'ABCPD1234K',
      aadhaarNumber: '343511546179',
      aadhaarConsent: true,
    });
    cy.goToNextStep();
    cy.fillStep4({
      currentAddressLine1: '123 Test Street',
      pinCode: '110001',
      residenceType: 'Owned',
      yearsAtAddress: '5',
      isSameAsPermanent: true,
    });
    cy.goToNextStep();
    cy.fillStep5({
      employmentType: 'Salaried',
      companyName: 'Test Corp',
      designation: 'Engineer',
      monthlyNetSalary: '80000',
      yearsOfExperience: '5',
    });

    cy.goToPrevStep();
    cy.goToPrevStep();
    cy.goToPrevStep();
    cy.goToPrevStep();
    cy.goToPrevStep();

    cy.get('[data-cy="step1-loan-type-Business"]').check({ force: true });
    cy.get('[data-cy="step1-loan-amount"] input').clear().type('3000000');
    cy.get('[data-cy="step1-loan-tenure"] select').select('60');
    cy.get('[data-cy="step1-loan-purpose"] select').select('expansion');

    cy.goToNextStep();
    cy.goToNextStep();
    cy.wait(1600);
    cy.goToNextStep();
    cy.goToNextStep();

    cy.contains('Business loan requires').should('be.visible');
    cy.get('[data-cy="step5-employment-type-Salaried"]').should('not.exist');

    cy.goToNextStep();
    cy.contains('Co-Applicant & Guarantor').should('be.visible');
  });

  it('defaults co-applicant relationship to Spouse when married', () => {
    cy.fillStep1({
      loanType: 'Personal',
      loanAmount: '800000',
      loanTenure: '36',
      loanPurpose: 'debt-consolidation',
    });
    cy.goToNextStep();
    cy.fillStep2({
      fullName: 'Married User',
      dateOfBirth: '1990-06-15',
      gender: 'Male',
      maritalStatus: 'Married',
      fatherName: 'Father',
      motherName: 'Mother',
      email: 'married@example.com',
      mobile: '9876543210',
    });
    cy.goToNextStep();
    cy.wait(1600);
    cy.fillStep3({
      panNumber: 'ABCPD1234K',
      aadhaarNumber: '343511546179',
      aadhaarConsent: true,
    });
    cy.goToNextStep();
    cy.fillStep4({
      currentAddressLine1: '123 Street',
      pinCode: '110001',
      residenceType: 'Owned',
      yearsAtAddress: '5',
      isSameAsPermanent: true,
    });
    cy.goToNextStep();
    cy.fillStep5({
      employmentType: 'Salaried',
      companyName: 'Test Corp',
      designation: 'Engineer',
      monthlyNetSalary: '80000',
      yearsOfExperience: '5',
    });
    cy.goToNextStep();

    cy.get('[data-cy="step6-relationship"] select').should('have.value', 'Spouse');
  });

  it('makes PAN copy optional when PAN is verified in Step 3', () => {
    cy.fillStep1({
      loanType: 'Personal',
      loanAmount: '500000',
      loanTenure: '36',
      loanPurpose: 'debt-consolidation',
    });
    cy.goToNextStep();
    cy.fillStep2({
      fullName: 'PAN Verified User',
      dateOfBirth: '1990-06-15',
      gender: 'Male',
      maritalStatus: 'Single',
      fatherName: 'Father',
      motherName: 'Mother',
      email: 'pan@example.com',
      mobile: '9876543210',
    });
    cy.goToNextStep();
    cy.wait(1600);
    cy.fillStep3({
      panNumber: 'ABCPD1234K',
      aadhaarNumber: '343511546179',
      aadhaarConsent: true,
    });
    cy.goToNextStep();
    cy.fillStep4({
      currentAddressLine1: '123 Street',
      pinCode: '110001',
      residenceType: 'Owned',
      yearsAtAddress: '5',
      isSameAsPermanent: true,
    });
    cy.goToNextStep();
    cy.fillStep5({
      employmentType: 'Salaried',
      companyName: 'Test Corp',
      designation: 'Engineer',
      monthlyNetSalary: '80000',
      yearsOfExperience: '5',
    });
    cy.goToNextStep();
    cy.goToNextStep();

    cy.get('[data-cy="step7-panCard"]').should('not.exist');
  });

  it('shows Extra EMI consent when EMI exceeds 50% of income', () => {
    cy.fillStep1({
      loanType: 'Personal',
      loanAmount: '800000',
      loanTenure: '36',
      loanPurpose: 'debt-consolidation',
    });
    cy.goToNextStep();
    cy.fillStep2({
      fullName: 'Low Income User',
      dateOfBirth: '1990-06-15',
      gender: 'Male',
      maritalStatus: 'Single',
      fatherName: 'Father',
      motherName: 'Mother',
      email: 'lowincome@example.com',
      mobile: '9876543210',
    });
    cy.goToNextStep();
    cy.wait(1600);
    cy.fillStep3({
      panNumber: 'ABCD 1234', /* not 10 chars → not verified → panCard required */
      aadhaarNumber: '343511546179',
      aadhaarConsent: true,
    });
    cy.goToNextStep();
    cy.fillStep4({
      currentAddressLine1: '123 Street',
      pinCode: '110001',
      residenceType: 'Owned',
      yearsAtAddress: '5',
      isSameAsPermanent: true,
    });
    cy.goToNextStep();
    cy.fillStep5({
      employmentType: 'Salaried',
      companyName: 'Test Corp',
      designation: 'Junior',
      monthlyNetSalary: '30000',
      yearsOfExperience: '2',
    });
    cy.goToNextStep();

    cy.fillStep6({
      coApplicantName: 'Co-App',
      coApplicantRelationship: 'Parent',
      coApplicantPan: 'EFGPD5678M',
      coApplicantIncome: '0',
    });
    cy.goToNextStep();

    cy.uploadDocument('panCard', 'cypress/fixtures/images/test-doc.pdf');
    cy.uploadDocument('aadhaarFront', 'cypress/fixtures/images/test-image.jpg');
    cy.uploadDocument('aadhaarBack', 'cypress/fixtures/images/test-image.jpg');
    cy.uploadDocument('salarySlips', 'cypress/fixtures/images/test-doc.pdf');
    cy.uploadDocument('bankStatements', 'cypress/fixtures/images/test-doc.pdf');
    cy.uploadDocument('photograph', 'cypress/fixtures/images/test-image.jpg');
    cy.drawSignature('step7-signature');
    cy.goToNextStep();

    cy.contains('EMI exceeds 50%').should('be.visible');
    cy.get('[data-cy="step8-consent-high-emi"]').should('be.visible');
    cy.get('[data-cy="step8-consent-high-emi"] input[type="checkbox"]').check({ force: true });
  });
});

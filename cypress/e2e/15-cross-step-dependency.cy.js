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

    cy.window().then((win) => win.__wizardGoToStep(0));

    cy.get('[data-cy="step1-loan-type-Business"]').check({ force: true });
    cy.get('[data-cy="step1-loan-amount"] input').clear().type('3000000');
    cy.get('[data-cy="step1-loan-tenure"] select').select('60');
    cy.get('[data-cy="step1-loan-purpose"] select').select('expansion');

    cy.window().then((win) => win.__wizardGoToStep(4));

    cy.contains('Business loan requires').should('be.visible');
    cy.get('[data-cy="step5-employment-type-Salaried"]').should('not.exist');

    cy.window().then((win) => win.__wizardGoToStep(5));
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

    cy.get('[data-cy="step7-panCard"]').should('exist');
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
      panNumber: 'ABCPD1234K', /* not 10 chars → not verified → panCard required */
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

    cy.uploadDocument('panCard', 'cypress/fixtures/samples/pan-card.jpg');
    cy.uploadDocument('aadhaarFront', 'cypress/fixtures/samples/aadhaar-front.jpg');
    cy.uploadDocument('aadhaarBack', 'cypress/fixtures/samples/aadhaar-back.jpg');
    cy.uploadDocument('salarySlips', 'cypress/fixtures/samples/salary-slip.pdf');
    cy.uploadDocument('bankStatements', 'cypress/fixtures/samples/bank-statement.pdf');
    cy.uploadDocument('photograph', 'cypress/fixtures/samples/photograph.jpg');
    cy.drawSignature('step7-signature');
    cy.goToNextStep();

    cy.contains('EMI exceeds 50%').should('be.visible');
    cy.get('[data-cy="step8-consent-high-emi"]').should('be.visible');
    cy.get('[data-cy="step8-consent-high-emi"] input[type="checkbox"]').check({ force: true });
  });
});

describe('E-Signature Capture', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
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
    cy.goToNextStep();
    cy.goToNextStep();
  });

  it('captures signature drawn on canvas', () => {
    cy.get('[data-cy="step7-signature"] canvas').should('be.visible');
    cy.drawSignature('step7-signature');
    cy.contains('Signature captured').should('be.visible');
  });

  it('shows signature in Step 8 review after drawing', () => {
    cy.drawSignature('step7-signature');
    cy.window().then((win) => {
      win.__wizardGoToStep(7);
    });
    cy.contains('Signed', { timeout: 10000 }).should('be.visible');
  });

  it('clears signature and shows validation error on submit', () => {
    cy.get('[data-cy="step7-signature-clear"]').click();
    cy.goToNextStep();
    cy.contains('signature is required').should('be.visible');
  });

  it('can draw, clear, and redraw signature', () => {
    cy.drawSignature('step7-signature');
    cy.contains('Signature captured').should('be.visible');

    cy.get('[data-cy="step7-signature-clear"]').click();
    cy.contains('Signature captured').should('not.exist');

    cy.drawSignature('step7-signature');
    cy.contains('Signature captured').should('be.visible');
  });
});

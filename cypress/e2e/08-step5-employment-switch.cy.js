describe('Step 5 - Employment Type Switching', () => {
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
  });

  it('switches from Salaried to Self-Employed and clears stale data', () => {
    cy.get('[data-cy="step5-employment-type-Salaried"]').check({ force: true });
    cy.get('[data-cy="step5-company-name"] input').type('Test Corp');
    cy.get('[data-cy="step5-designation"] input').type('Engineer');
    cy.get('[data-cy="step5-monthly-salary"] input').type('80000');
    cy.get('[data-cy="step5-experience"] input').type('5');

    cy.get('[data-cy="step5-employment-type-Self-Employed"]').check({ force: true });
    cy.get('[data-cy="step5-company-name"]').should('not.exist');
    cy.get('[data-cy="step5-business-name"]').should('be.visible');
    cy.get('[data-cy="step5-business-type"]').should('be.visible');
    cy.get('[data-cy="step5-annual-turnover"]').should('be.visible');
  });

  it('switches between all three employment types and shows correct fields', () => {
    cy.get('[data-cy="step5-employment-type-Salaried"]').check({ force: true });
    cy.contains('Salaried Employee Details').should('be.visible');

    cy.get('[data-cy="step5-employment-type-Self-Employed"]').check({ force: true });
    cy.contains('Self-Employed Details').should('be.visible');

    cy.get('[data-cy="step5-employment-type-Business Owner"]').check({ force: true });
    cy.contains('Business Owner Details').should('be.visible');
    cy.get('[data-cy="step5-gst-number"]').should('be.visible');
    cy.get('[data-cy="step5-office-address"]').should('be.visible');
  });

  it('filters out Salaried option when loan type is Business', () => {
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
  });
});

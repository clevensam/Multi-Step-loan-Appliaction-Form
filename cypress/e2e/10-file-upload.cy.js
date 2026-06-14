describe('File Upload & Compression', () => {
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
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy^="step6-"]').length) {
        cy.goToNextStep();
      }
    });
  });

  it('uploads a valid JPG image and shows preview', () => {
    cy.get('[data-cy="step7-photograph"] input[type="file"]').selectFile(
      'cypress/fixtures/samples/photograph.jpg', { force: true }
    );
    cy.get('[data-cy="step7-photograph"] img').should('be.visible');
  });

  it('uploads a valid PDF document', () => {
    cy.get('[data-cy="step7-bankStatements"] input[type="file"]').selectFile(
      'cypress/fixtures/samples/bank-statement.pdf', { force: true }
    );
    cy.get('[data-cy="step7-bankStatements"]').contains('PDF').should('be.visible');
  });

  it('compresses a large image and shows reduction info', () => {
    cy.get('[data-cy="step7-aadhaarFront"] input[type="file"]').selectFile(
      'cypress/fixtures/samples/compress-test.jpg', { force: true }
    );
    cy.contains('Compressing image', { timeout: 5000 }).should('be.visible');
    cy.contains('Original', { timeout: 30000 }).should('be.visible');
    cy.contains('smaller', { timeout: 30000 }).should('be.visible');
  });

  it('uploads multiple documents without error', () => {
    cy.uploadDocument('aadhaarFront', 'cypress/fixtures/samples/aadhaar-front.jpg');
    cy.wait(500);
    cy.uploadDocument('aadhaarBack', 'cypress/fixtures/samples/aadhaar-back.jpg');
    cy.wait(500);
    cy.uploadDocument('salarySlips', 'cypress/fixtures/samples/salary-slip.pdf');
    cy.wait(500);
    cy.uploadDocument('bankStatements', 'cypress/fixtures/samples/bank-statement.pdf');
    cy.wait(500);
    cy.uploadDocument('photograph', 'cypress/fixtures/samples/photograph.jpg');

    cy.get('[data-cy="step7-aadhaarFront"] img', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy="step7-aadhaarBack"] img', { timeout: 10000 }).should('be.visible');
  });

  it('shows error for missing required document on submit', () => {
    cy.uploadDocument('aadhaarFront', 'cypress/fixtures/samples/aadhaar-front.jpg');
    cy.uploadDocument('bankStatements', 'cypress/fixtures/samples/bank-statement.pdf');
    cy.uploadDocument('photograph', 'cypress/fixtures/samples/photograph.jpg');
    cy.drawSignature('step7-signature');
    cy.goToNextStep();
    cy.contains('Aadhaar Back').should('be.visible');
  });
});

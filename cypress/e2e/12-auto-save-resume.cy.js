describe('Auto-Save & Resume', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('saves progress and shows resume modal on reload', () => {
    cy.fillStep1({
      loanType: 'Personal',
      loanAmount: '500000',
      loanTenure: '36',
      loanPurpose: 'debt-consolidation',
    });

    cy.wait(4000);

    cy.reload();
    cy.contains('You have a saved draft', { timeout: 10000 }).should('be.visible');
    cy.contains('Last saved').should('be.visible');
  });

  it('restores data when Resume is clicked', () => {
    cy.fillStep1({
      loanType: 'Personal',
      loanAmount: '500000',
      loanTenure: '36',
      loanPurpose: 'debt-consolidation',
    });
    cy.goToNextStep();
    cy.fillStep2({
      fullName: 'Restored User',
      dateOfBirth: '1990-06-15',
      gender: 'Male',
      maritalStatus: 'Single',
      fatherName: 'Father Name',
      motherName: 'Mother Name',
      email: 'restored@example.com',
      mobile: '9876543210',
    });

    cy.wait(4000);

    cy.reload();
    cy.contains('You have a saved draft', { timeout: 10000 }).should('be.visible');
    cy.contains('Resume').click();
    cy.get('[data-cy="step2-full-name"] input').should('have.value', 'Restored User');
    cy.get('[data-cy="step2-email"] input').should('have.value', 'restored@example.com');
  });

  it('starts fresh when Start Fresh is clicked', () => {
    cy.fillStep1({
      loanType: 'Personal',
      loanAmount: '500000',
      loanTenure: '36',
      loanPurpose: 'debt-consolidation',
    });
    cy.goToNextStep();
    cy.fillStep2({
      fullName: 'Temp User',
      dateOfBirth: '1990-06-15',
      gender: 'Male',
      maritalStatus: 'Single',
      fatherName: 'Father Name',
      motherName: 'Mother Name',
      email: 'temp@example.com',
      mobile: '9876543210',
    });

    cy.wait(4000);

    cy.reload();
    cy.contains('You have a saved draft', { timeout: 10000 }).should('be.visible');
    cy.contains('Start Fresh').click();
    cy.get('[data-cy="step1-loan-type-Personal"]').should('exist');
    cy.get('[data-cy="step1-loan-amount"]').should('not.exist');
  });

  it('shows toast notification after auto-save', () => {
    cy.fillStep1({
      loanType: 'Personal',
      loanAmount: '500000',
      loanTenure: '36',
      loanPurpose: 'debt-consolidation',
    });

    cy.wait(4000);
    cy.contains('Draft saved at', { timeout: 5000 }).should('be.visible');
  });
});

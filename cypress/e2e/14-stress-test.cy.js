import personalLoan from '../fixtures/personal-loan.json';

describe('Stress Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('handles rapid Next clicks without state corruption', () => {
    for (let i = 0; i < 5; i++) {
      cy.contains('button', 'Next').click({ force: true });
    }
    cy.get('[role="alert"]').should('have.length.at.least', 2);
  });

  it('handles back-forward loop without data loss', () => {
    const data = personalLoan;
    cy.fillStep1(data.step1);
    cy.goToNextStep();

    cy.fillStep2(data.step2);
    cy.goToNextStep();

    cy.wait(1600);
    cy.fillStep3(data.step3);
    cy.goToNextStep();

    cy.fillStep4(data.step4);
    cy.goToNextStep();

    cy.goToPrevStep();
    cy.goToPrevStep();
    cy.goToPrevStep();
    cy.goToPrevStep();
    cy.goToPrevStep();

    cy.get('[data-cy="step1-loan-type-Personal"]').should('be.checked');
    cy.get('[data-cy="step1-loan-amount"] input').should('have.value', data.step1.loanAmount);

    cy.goToNextStep();
    cy.goToNextStep();
    cy.wait(1600);
    cy.goToNextStep();
    cy.goToNextStep();
    cy.get('[data-cy="step4-addr-line1"] input').should('have.value', data.step4.currentAddressLine1);
  });

  it('handles rapid Previous/Next cycling without state corruption', () => {
    cy.fillStep1({
      loanType: 'Personal',
      loanAmount: '500000',
      loanTenure: '36',
      loanPurpose: 'debt-consolidation',
    });
    cy.goToNextStep();

    cy.fillStep2({
      fullName: 'Stress Test User',
      dateOfBirth: '1990-06-15',
      gender: 'Male',
      maritalStatus: 'Single',
      fatherName: 'Father',
      motherName: 'Mother',
      email: 'stress@example.com',
      mobile: '9876543210',
    });
    cy.goToNextStep();

    cy.wait(1600);

    for (let i = 0; i < 3; i++) {
      cy.goToPrevStep();
      cy.goToNextStep();
    }

    cy.goToPrevStep();
    cy.get('[data-cy="step2-full-name"] input').should('have.value', 'Stress Test User');
    cy.get('[data-cy="step2-email"] input').should('have.value', 'stress@example.com');
  });

  it('prevents submit with missing required documents', () => {
    const data = personalLoan;

    cy.fillStep1(data.step1);
    cy.goToNextStep();
    cy.fillStep2(data.step2);
    cy.goToNextStep();
    cy.wait(1600);
    cy.fillStep3(data.step3);
    cy.goToNextStep();
    cy.fillStep4(data.step4);
    cy.goToNextStep();
    cy.fillStep5(data.step5);
    cy.goToNextStep();
    cy.fillStep6(data.step6);
    cy.goToNextStep();

    cy.uploadDocument('panCard', data.step7.documents.panCard);
    cy.uploadDocument('aadhaarFront', data.step7.documents.aadhaarFront);
    cy.uploadDocument('photograph', data.step7.documents.photograph);
    cy.drawSignature('step7-signature');
    cy.goToNextStep();

    cy.fillStep8(data.step8);
    cy.contains('button', 'Submit Application').should('be.disabled');
  });
});

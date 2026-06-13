import businessLoan from '../fixtures/business-loan.json';

describe('Business Loan Happy Path (Business Owner with GST)', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('completes business loan application with GST and registration docs', () => {
    const data = businessLoan;

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
    cy.uploadDocument('aadhaarBack', data.step7.documents.aadhaarBack);
    cy.uploadDocument('bankStatements', data.step7.documents.bankStatements);
    cy.uploadDocument('itrReturns', data.step7.documents.itrReturns);
    cy.uploadDocument('businessRegistration', data.step7.documents.businessRegistration);
    cy.uploadDocument('gstReturns', data.step7.documents.gstReturns);
    cy.uploadDocument('photograph', data.step7.documents.photograph);
    cy.drawSignature('step7-signature');
    cy.goToNextStep();

    cy.fillStep8(data.step8);

    cy.contains('button', 'Submit Application').should('be.enabled');
    cy.contains('button', 'Submit Application').click();

    cy.contains('Application Submitted!', { timeout: 10000 }).should('be.visible');
    cy.contains('Reference Number').should('be.visible');
  });
});

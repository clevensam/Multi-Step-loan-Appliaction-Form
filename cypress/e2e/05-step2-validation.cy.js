import invalidData from '../fixtures/invalid-data.json';

describe('Step 2 - Personal Info Validation', () => {
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
  });

  it('shows all required field errors on empty submit', () => {
    cy.goToNextStep();
    cy.contains('Name must be at least 2 characters').should('be.visible');
    cy.contains('Enter date of birth').should('be.visible');
    cy.contains('Please select your gender').should('be.visible');
    cy.contains('Please select marital status').should('be.visible');
  });

  it('rejects applicant younger than 21 years', () => {
    cy.get('[data-cy="step2-full-name"] input').type('Test User');
    cy.get('[data-cy="step2-dob"] input').type('2005-06-13');
    cy.get('[data-cy="step2-dob"] input').blur();
    cy.get('[data-cy="step2-gender"] select').select('Male');
    cy.get('[data-cy="step2-marital-status"] select').select('Single');
    cy.get('[data-cy="step2-father-name"] input').type('Father');
    cy.get('[data-cy="step2-mother-name"] input').type('Mother');
    cy.get('[data-cy="step2-email"] input').type('test@example.com');
    cy.get('[data-cy="step2-mobile"] input').type('9876543210');
    cy.goToNextStep();
    cy.contains('at least 21 years old').should('be.visible');
  });

  it('rejects applicant older than 65 years', () => {
    cy.get('[data-cy="step2-full-name"] input').type('Test User');
    cy.get('[data-cy="step2-dob"] input').type('1955-06-13');
    cy.get('[data-cy="step2-dob"] input').blur();
    cy.get('[data-cy="step2-gender"] select').select('Male');
    cy.get('[data-cy="step2-marital-status"] select').select('Single');
    cy.get('[data-cy="step2-father-name"] input').type('Father');
    cy.get('[data-cy="step2-mother-name"] input').type('Mother');
    cy.get('[data-cy="step2-email"] input').type('test@example.com');
    cy.get('[data-cy="step2-mobile"] input').type('9876543210');
    cy.goToNextStep();
    cy.contains('Maximum age is 65').should('be.visible');
  });

  it('accepts applicant exactly 21 years old (age boundary)', () => {
    cy.get('[data-cy="step2-full-name"] input').type('Test User');
    cy.get('[data-cy="step2-dob"] input').type(invalidData.ageBoundaryAccept);
    cy.get('[data-cy="step2-dob"] input').blur();
    cy.get('[data-cy="step2-gender"] select').select('Male');
    cy.get('[data-cy="step2-marital-status"] select').select('Single');
    cy.get('[data-cy="step2-father-name"] input').type('Father');
    cy.get('[data-cy="step2-mother-name"] input').type('Mother');
    cy.get('[data-cy="step2-email"] input').type('test@example.com');
    cy.get('[data-cy="step2-mobile"] input').type('9876543210');
    cy.get('[data-cy="step2-dob"]').should('not.contain', 'at least 21');
    cy.goToNextStep();
  });

  it('rejects invalid email format', () => {
    cy.get('[data-cy="step2-full-name"] input').type('Test User');
    cy.get('[data-cy="step2-dob"] input').type('1990-06-15');
    cy.get('[data-cy="step2-gender"] select').select('Male');
    cy.get('[data-cy="step2-marital-status"] select').select('Single');
    cy.get('[data-cy="step2-father-name"] input').type('Father');
    cy.get('[data-cy="step2-mother-name"] input').type('Mother');
    cy.get('[data-cy="step2-email"] input').type('not-an-email');
    cy.get('[data-cy="step2-email"] input').blur();
    cy.get('[data-cy="step2-mobile"] input').type('9876543210');
    cy.goToNextStep();
    cy.contains('Enter a valid email').should('be.visible');
  });

  it('rejects mobile not starting with 6-9', () => {
    cy.get('[data-cy="step2-full-name"] input').type('Test User');
    cy.get('[data-cy="step2-dob"] input').type('1990-06-15');
    cy.get('[data-cy="step2-gender"] select').select('Male');
    cy.get('[data-cy="step2-marital-status"] select').select('Single');
    cy.get('[data-cy="step2-father-name"] input').type('Father');
    cy.get('[data-cy="step2-mother-name"] input').type('Mother');
    cy.get('[data-cy="step2-email"] input').type('test@example.com');
    cy.get('[data-cy="step2-mobile"] input').type('1234567890');
    cy.get('[data-cy="step2-mobile"] input').blur();
    cy.goToNextStep();
    cy.contains('Mobile must start with 6-9').should('be.visible');
  });

  it('rejects alternate mobile matching primary mobile', () => {
    cy.get('[data-cy="step2-full-name"] input').type('Test User');
    cy.get('[data-cy="step2-dob"] input').type('1990-06-15');
    cy.get('[data-cy="step2-gender"] select').select('Male');
    cy.get('[data-cy="step2-marital-status"] select').select('Single');
    cy.get('[data-cy="step2-father-name"] input').type('Father');
    cy.get('[data-cy="step2-mother-name"] input').type('Mother');
    cy.get('[data-cy="step2-email"] input').type('test@example.com');
    cy.get('[data-cy="step2-mobile"] input').type('9876543210');
    cy.get('[data-cy="step2-alternate-mobile"] input').type('9876543210');
    cy.get('[data-cy="step2-alternate-mobile"] input').blur();
    cy.goToNextStep();
    cy.contains('must differ from mobile').should('be.visible');
  });
});

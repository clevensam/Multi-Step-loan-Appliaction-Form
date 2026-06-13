import invalidData from '../fixtures/invalid-data.json';

describe('Step 1 - Validation Errors', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('shows loan type required error on empty submit', () => {
    cy.goToNextStep();
    cy.contains('Please select a loan type').should('be.visible');
  });

  it('rejects amount below minimum (50,000)', () => {
    cy.get('[data-cy="step1-loan-type-Personal"]').check({ force: true });
    cy.get('[data-cy="step1-loan-amount"] input').type('10000');
    cy.get('[data-cy="step1-loan-amount"] input').blur();
    cy.goToNextStep();
    cy.contains('Minimum amount').should('be.visible');
  });

  it('rejects amount exceeding maximum for loan type', () => {
    cy.get('[data-cy="step1-loan-type-Personal"]').check({ force: true });
    cy.get('[data-cy="step1-loan-amount"] input').type('2000000');
    cy.get('[data-cy="step1-loan-amount"] input').blur();
    cy.goToNextStep();
    cy.contains('Maximum amount').should('be.visible');
  });

  it('rejects tenure below minimum for Personal loan', () => {
    cy.get('[data-cy="step1-loan-type-Personal"]').check({ force: true });
    cy.get('[data-cy="step1-loan-amount"] input').type('500000');
    cy.get('[data-cy="step1-loan-tenure"] select').select('12');
    cy.goToNextStep();
    cy.contains('Select loan purpose').should('be.visible');
  });

  it('boundary: exact 5L for Personal Loan does NOT trigger Step 6', () => {
    cy.get('[data-cy="step1-loan-type-Personal"]').check({ force: true });
    cy.get('[data-cy="step1-loan-amount"] input').type(invalidData.thresholdAmountExact);
    cy.get('[data-cy="step1-loan-tenure"] select').select('36');
    cy.get('[data-cy="step1-loan-purpose"] select').select('debt-consolidation');
    cy.goToNextStep();

    cy.get('[data-cy="step2-full-name"] input').type('Test User');
    cy.get('[data-cy="step2-dob"] input').type('1990-06-15');
    cy.get('[data-cy="step2-gender"] select').select('Male');
    cy.get('[data-cy="step2-marital-status"] select').select('Single');
    cy.get('[data-cy="step2-father-name"] input').type('Father');
    cy.get('[data-cy="step2-mother-name"] input').type('Mother');
    cy.get('[data-cy="step2-email"] input').type('test@example.com');
    cy.get('[data-cy="step2-mobile"] input').type('9876543210');
    cy.goToNextStep();

    cy.get('[data-cy="step3-pan"] input').type('ABCPD1234K');
    cy.get('[data-cy="step3-pan"] input').blur();
    cy.contains('Verifying', { timeout: 2000 }).should('be.visible');
    cy.contains('Verified', { timeout: 5000 }).should('be.visible');
    cy.get('[data-cy="step3-aadhaar"] input').clear().type('343511546179');
    cy.get('[data-cy="step3-aadhaar"] input').blur();
    cy.contains('Verifying', { timeout: 2000 }).should('be.visible');
    cy.contains('Verified', { timeout: 5000 }).should('be.visible');
    cy.get('[data-cy="step3-aadhaar-consent"] input[type="checkbox"]').check({ force: true });
    cy.goToNextStep();
    cy.contains('Address Information').should('be.visible');

    cy.get('[data-cy="step4-addr-line1"] input').type('123 Test Street');
    cy.get('[data-cy="step4-pincode"] input').type('110001');
    cy.get('[data-cy="step4-residence-type-Owned"]').check({ force: true });
    cy.get('[data-cy="step4-years-addr"] input').type('5');
    cy.get('[data-cy="step4-same-permanent"] input[type="checkbox"]').check({ force: true });
    cy.goToNextStep();

    cy.get('[data-cy="step5-employment-type-Salaried"]').check({ force: true });
    cy.get('[data-cy="step5-company-name"] input').type('Test Corp');
    cy.get('[data-cy="step5-designation"] input').type('Engineer');
    cy.get('[data-cy="step5-monthly-salary"] input').type('80000');
    cy.get('[data-cy="step5-experience"] input').type('5');

    cy.get('header').should('not.contain', 'Co-Applicant');
    cy.goToNextStep();
    cy.contains('Document Upload').should('be.visible');
  });
});

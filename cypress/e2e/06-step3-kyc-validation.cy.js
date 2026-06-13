import invalidData from '../fixtures/invalid-data.json';

describe('Step 3 - KYC Validation', () => {
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
  });

  it('rejects invalid PAN format', () => {
    cy.get('[data-cy="step3-pan"] input').type(invalidData.invalidPanFormats[0]);
    cy.get('[data-cy="step3-pan"] input').blur();
    cy.contains('PAN must be 10 characters').should('be.visible');
  });

  it('rejects PAN with wrong entity type for personal loan', () => {
    cy.get('[data-cy="step3-pan"] input').type(invalidData.invalidPanEntity);
    cy.get('[data-cy="step3-pan"] input').blur();
    cy.contains('4th PAN character must be P').should('be.visible');
  });

  it('rejects invalid Aadhaar (wrong length)', () => {
    cy.get('[data-cy="step3-pan"] input').type(invalidData.invalidPanEntity);
    cy.get('[data-cy="step3-pan"] input').blur();
    cy.contains('4th PAN character must be P', { timeout: 2000 }).should('be.visible');
    cy.get('[data-cy="step3-aadhaar"] input').type(invalidData.invalidAadhaarFormats[0]);
    cy.get('[data-cy="step3-aadhaar"] input').blur();
    cy.contains('Aadhaar must be exactly 12 digits').should('be.visible');
  });

  it('rejects invalid Aadhaar Verhoeff checksum', () => {
    cy.get('[data-cy="step3-pan"] input').type(invalidData.invalidPanEntity);
    cy.get('[data-cy="step3-pan"] input').blur();
    cy.contains('4th PAN character must be P', { timeout: 2000 }).should('be.visible');
    cy.get('[data-cy="step3-aadhaar"] input').type(invalidData.invalidAadhaarChecksum);
    cy.get('[data-cy="step3-aadhaar"] input').blur();
    cy.contains('checksum failed').should('be.visible');
  });

  it('shows error when Aadhaar consent is not checked', () => {
    cy.get('[data-cy="step3-pan"] input').type(invalidData.invalidPanEntity);
    cy.get('[data-cy="step3-pan"] input').blur();
    cy.contains('4th PAN character must be P', { timeout: 2000 }).should('be.visible');
    cy.get('[data-cy="step3-aadhaar"] input').type('343511546179');
    cy.get('[data-cy="step3-aadhaar"] input').blur();
    cy.contains('Verifying', { timeout: 2000 }).should('be.visible');
    cy.contains('Verified', { timeout: 5000 }).should('be.visible');
    cy.goToNextStep();
    cy.contains('consent to Aadhaar').should('be.visible');
  });

  it('shows verification spinner then verified badge for valid PAN', () => {
    cy.get('[data-cy="step3-pan"] input').type('ABCPD1234K');
    cy.get('[data-cy="step3-pan"] input').blur();
    cy.contains('Verifying...').should('be.visible');
    cy.wait(1600);
    cy.contains('Verified').should('be.visible');
  });
});

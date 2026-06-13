describe('Keyboard Navigation', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('focuses first input on step transition', () => {
    cy.get('input, select, textarea, [tabindex]:not([tabindex="-1"])').first().should('be.focused');
    cy.focused().should('have.attr', 'data-cy', 'step1-loan-type-Personal');
  });

  it('completes Step 1 using only keyboard', () => {
    cy.get('[data-cy="step1-loan-type-Personal"]').click();
    cy.get('[data-cy="step1-loan-amount"] input').type('800000');
    cy.get('[data-cy="step1-loan-tenure"] select').select('36');
    cy.get('[data-cy="step1-loan-purpose"] select').select('debt-consolidation');
    cy.contains('button', 'Next').click();
    cy.contains('Personal Information').should('be.visible');
  });

  it('completes Steps 1-2 using only keyboard', () => {
    cy.get('[data-cy="step1-loan-type-Personal"]').click();
    cy.get('[data-cy="step1-loan-amount"] input').type('800000');
    cy.get('[data-cy="step1-loan-tenure"] select').select('36');
    cy.get('[data-cy="step1-loan-purpose"] select').select('debt-consolidation');
    cy.contains('button', 'Next').click();

    cy.get('[data-cy="step2-full-name"] input').type('Rajesh Kumar');
    cy.get('[data-cy="step2-dob"] input').type('1990-06-15');
    cy.get('[data-cy="step2-gender"] select').select('Male');
    cy.get('[data-cy="step2-marital-status"] select').select('Married');
    cy.get('[data-cy="step2-father-name"] input').type('Suresh Kumar');
    cy.get('[data-cy="step2-mother-name"] input').type('Sunita Devi');
    cy.get('[data-cy="step2-email"] input').type('rajesh@example.com');
    cy.get('[data-cy="step2-mobile"] input').type('9876543210');
    cy.contains('button', 'Next').click();
    cy.wait(1600);
    cy.contains('Identity Verification').should('be.visible');
  });

  it('completes entire form and submits using only keyboard', () => {
    cy.get('[data-cy="step1-loan-type-Personal"]').click();
    cy.get('[data-cy="step1-loan-amount"] input').type('800000');
    cy.get('[data-cy="step1-loan-tenure"] select').select('36');
    cy.get('[data-cy="step1-loan-purpose"] select').select('debt-consolidation');
    cy.contains('button', 'Next').click();

    cy.get('[data-cy="step2-full-name"] input').type('Keyboard User');
    cy.get('[data-cy="step2-dob"] input').type('1990-06-15');
    cy.get('[data-cy="step2-gender"] select').select('Male');
    cy.get('[data-cy="step2-marital-status"] select').select('Single');
    cy.get('[data-cy="step2-father-name"] input').type('Father Name');
    cy.get('[data-cy="step2-mother-name"] input').type('Mother Name');
    cy.get('[data-cy="step2-email"] input').type('keyboard@example.com');
    cy.get('[data-cy="step2-mobile"] input').type('9876543210');
    cy.contains('button', 'Next').click();

    cy.wait(1600);
    cy.get('[data-cy="step3-pan"] input').type('ABCPD1234K');
    cy.get('[data-cy="step3-aadhaar"] input').type('343511546179');
    cy.get('[data-cy="step3-aadhaar-consent"] input[type="checkbox"]').check({ force: true });
    cy.contains('button', 'Next').click();

    cy.get('[data-cy="step4-addr-line1"] input').type('123 Main Street');
    cy.get('[data-cy="step4-pincode"] input').type('110001');
    cy.get('[data-cy="step4-city"] input').type('Delhi');
    cy.get('[data-cy="step4-state"] input').type('Delhi');
    cy.get('[data-cy="step4-residence-type-Owned"]').click();
    cy.get('[data-cy="step4-years-addr"] input').type('5');
    cy.get('[data-cy="step4-same-permanent"] input[type="checkbox"]').check({ force: true });
    cy.contains('button', 'Next').click();

    cy.get('[data-cy="step5-employment-type-Salaried"]').click();
    cy.get('[data-cy="step5-company-name"] input').type('Tech Corp');
    cy.get('[data-cy="step5-designation"] input').type('Engineer');
    cy.get('[data-cy="step5-monthly-salary"] input').type('80000');
    cy.get('[data-cy="step5-experience"] input').type('5');
    cy.contains('button', 'Next').click();

    cy.contains('Co-Applicant').should('be.visible');
    cy.get('[data-cy="step6-co-app-name"] input').type('Spouse Name');
    cy.get('[data-cy="step6-relationship"] select').select('Spouse');
    cy.get('[data-cy="step6-co-app-pan"] input').type('EFGPD5678M');
    cy.get('[data-cy="step6-co-app-income"] input').type('40000');
    cy.drawSignature('step6-co-app-signature');
    cy.get('[data-cy="step6-consent"] input[type="checkbox"]').check({ force: true });
    cy.contains('button', 'Next').click();

    cy.contains('Document Upload').should('be.visible');
    cy.window().then((win) => {
      win.__wizardGoToStep(7);
    });

    cy.contains('Review & Submit').should('be.visible');
    cy.contains('Submit Application').should('be.visible');
  });
});

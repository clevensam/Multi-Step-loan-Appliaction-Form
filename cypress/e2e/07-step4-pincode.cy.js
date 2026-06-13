describe('Step 4 - PIN Code Lookup', () => {
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
  });

  it('auto-fills city and state from valid PIN code', () => {
    cy.get('[data-cy="step4-pincode"] input').clear().type('110001');
    cy.get('[data-cy="step4-pincode"] input').blur();
    cy.get('[data-cy="step4-city"] input').should('not.have.value', '');
    cy.get('[data-cy="step4-state"] input').should('not.have.value', '');
  });

  it('auto-fills from another valid PIN code', () => {
    cy.get('[data-cy="step4-pincode"] input').clear().type('110020');
    cy.get('[data-cy="step4-pincode"] input').blur();
    cy.get('[data-cy="step4-city"] input').should('not.have.value', '');
  });

  it('shows rent amount field when residence type is Rented', () => {
    cy.get('[data-cy="step4-pincode"] input').clear().type('110001');
    cy.get('[data-cy="step4-residence-type-Rented"]').check({ force: true });
    cy.get('[data-cy="step4-rent-amount"]').should('be.visible');
    cy.get('[data-cy="step4-rent-amount"] input').type('15000');
  });

  it('shows previous address section when years at address is 0', () => {
    cy.get('[data-cy="step4-pincode"] input').clear().type('110001');
    cy.get('[data-cy="step4-residence-type-Owned"]').check({ force: true });
    cy.get('[data-cy="step4-years-addr"] input').clear().type('0');
    cy.get('[data-cy="step4-years-addr"] input').blur();
    cy.contains('Previous Address').should('be.visible');
    cy.get('[data-cy="step4-prev-addr-line1"]').should('be.visible');
  });

  it('shows permanent address fields when "Same as Permanent" is unchecked', () => {
    cy.get('[data-cy="step4-pincode"] input').clear().type('110001');
    cy.get('[data-cy="step4-residence-type-Owned"]').check({ force: true });
    cy.get('[data-cy="step4-years-addr"] input').clear().type('5');
    cy.get('[data-cy="step4-same-permanent"] input[type="checkbox"]').uncheck({ force: true });
    cy.get('[data-cy="step4-perm-addr-line1"]').should('be.visible');
    cy.get('[data-cy="step4-perm-pincode"]').should('be.visible');
  });

  it('copies current address to permanent when "Same as Permanent" is checked', () => {
    cy.get('[data-cy="step4-addr-line1"] input').clear().type('42, Test Street');
    cy.get('[data-cy="step4-pincode"] input').clear().type('110001');
    cy.get('[data-cy="step4-residence-type-Owned"]').check({ force: true });
    cy.get('[data-cy="step4-years-addr"] input').clear().type('5');
    cy.get('[data-cy="step4-same-permanent"] input[type="checkbox"]').check({ force: true });
    cy.get('[data-cy="step4-perm-addr-line1"]').should('not.exist');
  });

  it('shows error on empty PIN submit', () => {
    cy.get('[data-cy="step4-addr-line1"] input').type('123 Test Street');
    cy.get('[data-cy="step4-residence-type-Owned"]').check({ force: true });
    cy.get('[data-cy="step4-years-addr"] input').clear().type('5');
    cy.goToNextStep();
    cy.contains('PIN').should('be.visible');
  });
});

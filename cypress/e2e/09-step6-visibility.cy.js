describe('Step 6 - Conditional Visibility', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  function fillToStep5(loanType, amount, tenure, purpose) {
    cy.fillStep1({
      loanType,
      loanAmount: amount,
      loanTenure: tenure,
      loanPurpose: purpose,
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
    const step3Data = {
      panNumber: 'ABCPD1234K',
      aadhaarNumber: '343511546179',
      aadhaarConsent: true,
    };
    if (loanType === 'Home') {
      step3Data.passport = 'A1234567';
    }
    cy.fillStep3(step3Data);
    cy.goToNextStep();
    cy.fillStep4({
      currentAddressLine1: '123 Test Street',
      pinCode: '110001',
      residenceType: 'Owned',
      yearsAtAddress: '5',
      isSameAsPermanent: true,
    });
    cy.goToNextStep();
    if (loanType === 'Business') {
      cy.fillStep5({
        employmentType: 'Business Owner',
        businessName: 'Test Business',
        businessType: 'private-limited',
        annualTurnover: '5000000',
        yearsInBusiness: '5',
        monthlyIncome: '150000',
        gstNumber: '29ABCDE1234F1Z5',
        officeAddress: '123 Test Street',
      });
    } else {
      cy.fillStep5({
        employmentType: 'Salaried',
        companyName: 'Test Corp',
        designation: 'Engineer',
        monthlyNetSalary: '80000',
        yearsOfExperience: '5',
      });
    }
  }

  it('shows Step 6 for Personal Loan > 5L', () => {
    fillToStep5('Personal', '800000', '36', 'debt-consolidation');
    cy.goToNextStep();
    cy.contains('Co-Applicant & Guarantor').should('be.visible');
  });

  it('hides Step 6 for Personal Loan = 5L exactly (threshold is "exceeds")', () => {
    fillToStep5('Personal', '500000', '36', 'debt-consolidation');
    cy.goToNextStep();
    cy.contains('Document Upload').should('be.visible');
    cy.contains('Co-Applicant & Guarantor').should('not.exist');
  });

  it('shows Step 6 for Home Loan always (regardless of amount)', () => {
    fillToStep5('Home', '5000000', '240', 'purchase');
    cy.goToNextStep();
    cy.contains('Co-Applicant & Guarantor').should('be.visible');
  });

  it('shows Step 6 for Business Loan > 20L', () => {
    fillToStep5('Business', '3000000', '60', 'expansion');
    cy.goToNextStep();
    cy.contains('Co-Applicant & Guarantor').should('be.visible');
  });

  it('hides Step 6 for Business Loan <= 20L', () => {
    fillToStep5('Business', '1500000', '60', 'expansion');
    cy.goToNextStep();
    cy.contains('Document Upload').should('be.visible');
    cy.contains('Co-Applicant & Guarantor').should('not.exist');
  });

  it('dynamically inserts Step 6 when amount changes mid-flow', () => {
    fillToStep5('Personal', '300000', '36', 'debt-consolidation');
    cy.goToNextStep();
    cy.contains('Document Upload').should('be.visible');
    cy.contains('Co-Applicant & Guarantor').should('not.exist');

    cy.goToPrevStep();
    cy.goToPrevStep();
    cy.goToPrevStep();
    cy.goToPrevStep();
    cy.goToPrevStep();
    cy.get('[data-cy="step1-loan-amount"] input').clear().type('800000');
    cy.goToNextStep();
    cy.goToNextStep();
    cy.goToNextStep();
    cy.wait(1600);
    cy.goToNextStep();
    cy.goToNextStep();
    cy.goToNextStep();
    cy.contains('Co-Applicant & Guarantor').should('be.visible');
  });
});

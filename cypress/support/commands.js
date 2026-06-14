Cypress.Commands.add('fillStep1', (data) => {
  cy.get(`[data-cy="step1-loan-type-${data.loanType}"]`).check({ force: true });
  if (data.loanAmount) {
    cy.get('[data-cy="step1-loan-amount"] input').clear().type(data.loanAmount);
  }
  if (data.loanTenure) {
    cy.get('[data-cy="step1-loan-tenure"] select').select(data.loanTenure);
  }
  if (data.loanPurpose) {
    cy.get('[data-cy="step1-loan-purpose"] select').select(data.loanPurpose);
  }
  if (data.referralCode) {
    cy.get('[data-cy="step1-referral-code"] input').type(data.referralCode);
  }
});

Cypress.Commands.add('fillStep2', (data) => {
  cy.get('[data-cy="step2-full-name"] input').clear().type(data.fullName);
  cy.get('[data-cy="step2-dob"] input').clear().type(data.dateOfBirth);
  cy.get('[data-cy="step2-gender"] select').select(data.gender);
  cy.get('[data-cy="step2-marital-status"] select').select(data.maritalStatus);
  cy.get('[data-cy="step2-father-name"] input').clear().type(data.fatherName);
  cy.get('[data-cy="step2-mother-name"] input').clear().type(data.motherName);
  cy.get('[data-cy="step2-email"] input').clear().type(data.email);
  cy.get('[data-cy="step2-mobile"] input').clear().type(data.mobile);
  if (data.alternateMobile) {
    cy.get('[data-cy="step2-alternate-mobile"] input').clear().type(data.alternateMobile);
  }
});

Cypress.Commands.add('fillStep3', (data) => {
  cy.get('[data-cy="step3-pan"] input').clear().type(data.panNumber);
  cy.get('[data-cy="step3-pan"] input').blur();
  cy.get('[data-cy="step3-aadhaar"] input').clear().type(data.aadhaarNumber);
  cy.get('[data-cy="step3-aadhaar"] input').blur();
  cy.get('[data-cy="step3-aadhaar-consent"] input[type="checkbox"]').check({ force: true });
  if (data.voterId) {
    cy.get('[data-cy="step3-voter-id"] input').clear().type(data.voterId);
  }
  if (data.passport) {
    cy.get('[data-cy="step3-passport"] input').clear().type(data.passport);
  }
});

Cypress.Commands.add('fillStep4', (data) => {
  cy.get('[data-cy="step4-addr-line1"] input').clear().type(data.currentAddressLine1);
  if (data.currentAddressLine2) {
    cy.get('[data-cy="step4-addr-line2"] input').clear().type(data.currentAddressLine2);
  }
  cy.get('[data-cy="step4-pincode"] input').clear().type(data.pinCode);
  cy.get(`[data-cy="step4-residence-type-${data.residenceType}"]`).check({ force: true });
  cy.get('[data-cy="step4-years-addr"] input').clear().type(data.yearsAtAddress);
  if (data.rentAmount) {
    cy.get('[data-cy="step4-rent-amount"] input').clear().type(data.rentAmount);
  }
  if (data.isSameAsPermanent) {
    cy.get('[data-cy="step4-same-permanent"] input[type="checkbox"]').check({ force: true });
  } else {
    cy.get('[data-cy="step4-perm-addr-line1"] input').clear().type(data.permanentAddressLine1);
    cy.get('[data-cy="step4-perm-pincode"] input').clear().type(data.permanentPinCode);
    cy.wait(500);
  }
});

Cypress.Commands.add('fillStep5', (data) => {
  cy.get(`[data-cy="step5-employment-type-${data.employmentType}"]`).check({ force: true });
  if (data.employmentType === 'Salaried') {
    cy.get('[data-cy="step5-company-name"] input').clear().type(data.companyName);
    cy.get('[data-cy="step5-designation"] input').clear().type(data.designation);
    cy.get('[data-cy="step5-monthly-salary"] input').clear().type(data.monthlyNetSalary);
    cy.get('[data-cy="step5-experience"] input').clear().type(data.yearsOfExperience);
  } else {
    cy.get('[data-cy="step5-business-name"] input').clear().type(data.businessName);
    cy.get('[data-cy="step5-business-type"] select').select(data.businessType);
    cy.get('[data-cy="step5-annual-turnover"] input').clear().type(data.annualTurnover);
    cy.get('[data-cy="step5-years-business"] input').clear().type(data.yearsInBusiness);
    if (data.employmentType === 'Self-Employed') {
      cy.get('[data-cy="step5-monthly-income"] input').clear().type(data.monthlyIncome);
    }
    if (data.employmentType === 'Business Owner') {
      cy.get('[data-cy="step5-gst-number"] input').clear().type(data.gstNumber);
      cy.get('[data-cy="step5-office-address"] input').clear().type(data.officeAddress);
    }
  }
});

Cypress.Commands.add('fillStep6', (data) => {
  cy.get('[data-cy="step6-co-app-name"] input').clear().type(data.coApplicantName);
  cy.get('[data-cy="step6-relationship"] select').select(data.coApplicantRelationship);
  cy.get('[data-cy="step6-co-app-pan"] input').clear().type(data.coApplicantPan);
  cy.get('[data-cy="step6-co-app-pan"] input').blur();
  cy.get('[data-cy="step6-co-app-income"] input').clear().type(data.coApplicantIncome);
  cy.drawSignature('step6-co-app-signature');
  cy.get('[data-cy="step6-consent"] input[type="checkbox"]').check({ force: true });
});

Cypress.Commands.add('fillStep7', (data) => {
  const docs = data.documents || {};
  Object.entries(docs).forEach(([key, filePath]) => {
    cy.uploadDocument(key, filePath);
  });
  cy.drawSignature('step7-signature');
});

Cypress.Commands.add('fillStep8', (data) => {
  const consents = data.consents || ['consent-accurate', 'consent-credit', 'consent-terms', 'consent-comm'];
  consents.forEach((consent) => {
    cy.get(`[data-cy="step8-${consent}"] input[type="checkbox"]`).check({ force: true });
  });
  if (data.consentHighEmi) {
    cy.get('[data-cy="step8-consent-high-emi"] input[type="checkbox"]').check({ force: true });
  }
});

Cypress.Commands.add('uploadDocument', (docKey, filePath) => {
  cy.get(`[data-cy="step7-${docKey}"] input[type="file"]`).selectFile(filePath, { force: true });
});

Cypress.Commands.add('drawSignature', (dataCy) => {
  const dcy = dataCy;
  cy.get(`[data-cy="${dcy}-canvas"]`).then(($canvas) => {
    const canvas = $canvas[0];
    const rect = canvas.getBoundingClientRect();
    const startX = rect.left + rect.width * 0.2;
    const startY = rect.top + rect.height * 0.5;
    const midX = rect.left + rect.width * 0.5;
    const endX = rect.left + rect.width * 0.8;

    const opts = { button: 0, which: 1, bubbles: true, cancelable: true, view: window };

    cy.wrap(canvas)
      .trigger('mousedown', { ...opts, clientX: startX, clientY: startY, force: true })
      .trigger('mousemove', { ...opts, clientX: midX, clientY: startY, force: true })
      .trigger('mousemove', { ...opts, clientX: endX, clientY: startY, force: true });

    cy.document().then((doc) => {
      doc.dispatchEvent(new MouseEvent('mouseup', { ...opts, clientX: endX, clientY: startY }));
    });
  });
  cy.wait(300);
});

Cypress.Commands.add('setFormData', (fields) => {
  Object.entries(fields).forEach(([key, value]) => {
    const el = document.querySelector(`[data-cy="step-${key}"]`);
    if (el) {
      cy.wrap(el).clear().type(value);
    }
  });
});

Cypress.Commands.add('goToStep', (stepIndex) => {
  cy.url().then((url) => {
    const params = new URL(url).searchParams;
    const currentStep = parseInt(params.get('step') || '0', 10);
    const diff = stepIndex - currentStep;

    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        cy.goToNextStep();
      }
    } else if (diff < 0) {
      for (let i = 0; i < Math.abs(diff); i++) {
        cy.goToPrevStep();
      }
    }
  });
});

Cypress.Commands.add('goToNextStep', () => {
  cy.contains('button', 'Next').click();
});

Cypress.Commands.add('goToPrevStep', () => {
  cy.contains('button', 'Previous').click();
});

Cypress.Commands.add('triggerAutoSave', (storageKey) => {
  cy.clock();
  cy.tick(31000);
  cy.clock().invoke('restore');
});

Cypress.Commands.add('completeAllSteps', (fixtureData) => {
  const data = fixtureData;
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

  if (data.step6) {
    cy.fillStep6(data.step6);
    cy.goToNextStep();
  }

  cy.fillStep7(data.step7);
  cy.goToNextStep();

  cy.fillStep8(data.step8);
});

import { useCallback, useEffect, useRef } from 'react';
import Input from './common/Input';
import RadioGroup from './common/RadioGroup';
import Checkbox from './common/Checkbox';
import usePinCodeLookup from '../hooks/usePinCodeLookup';
import { RESIDENCE_TYPES } from '../constants';

export default function Step4Address({ formData, updateFields, errors }) {
  const {
    currentAddressLine1, currentAddressLine2, pinCode, city, state,
    residenceType, rentAmount, yearsAtAddress,
    previousAddressLine1, previousAddressLine2, isSameAsPermanent,
    permanentAddressLine1, permanentAddressLine2, permanentPinCode,
    permanentCity, permanentState,
  } = formData;

  const pinLookup = usePinCodeLookup(pinCode);
  const permanentPinLookup = usePinCodeLookup(permanentPinCode);
  const isRented = residenceType === 'Rented';
  const showPreviousAddress = Number(yearsAtAddress) < 1 && yearsAtAddress !== '';

  const userEdited = useRef({ city: false, state: false, permCity: false, permState: false });

  useEffect(() => {
    if (pinLookup.city && pinLookup.state && !userEdited.current.city && !userEdited.current.state) {
      updateFields({ city: pinLookup.city, state: pinLookup.state });
    }
  }, [pinLookup.city, pinLookup.state, updateFields]);

  useEffect(() => {
    if (permanentPinLookup.city && permanentPinLookup.state && !userEdited.current.permCity && !userEdited.current.permState) {
      updateFields({ permanentCity: permanentPinLookup.city, permanentState: permanentPinLookup.state });
    }
  }, [permanentPinLookup.city, permanentPinLookup.state, updateFields]);

  const handleChange = useCallback((field) => (e) => {
    const value = e.target?.type === 'checkbox' ? e.target.checked : e.target?.value !== undefined ? e.target.value : e;
    const updates = { [field]: value };

    if (field === 'city') userEdited.current.city = true;
    if (field === 'state') userEdited.current.state = true;
    if (field === 'permanentCity') userEdited.current.permCity = true;
    if (field === 'permanentState') userEdited.current.permState = true;

    if (field === 'isSameAsPermanent' && value) {
      updates.permanentAddressLine1 = currentAddressLine1 || '';
      updates.permanentAddressLine2 = currentAddressLine2 || '';
      updates.permanentPinCode = pinCode || '';
      updates.permanentCity = city || '';
      updates.permanentState = state || '';
    }

    if (field === 'pinCode') {
      userEdited.current.city = false;
      userEdited.current.state = false;
    }

    if (field === 'permanentPinCode') {
      userEdited.current.permCity = false;
      userEdited.current.permState = false;
    }

    updateFields(updates);
  }, [updateFields, currentAddressLine1, currentAddressLine2, pinCode, city, state]);

  const handlePinChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    userEdited.current.city = false;
    userEdited.current.state = false;
    updateFields({ pinCode: value });
  }, [updateFields]);

  const handlePermanentPinChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    userEdited.current.permCity = false;
    userEdited.current.permState = false;
    updateFields({ permanentPinCode: value });
  }, [updateFields]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Address Information</h2>

      <h3 className="text-lg font-medium text-gray-700 mb-3">Current Address</h3>

      <Input
        label="Address Line 1"
        value={currentAddressLine1}
        onChange={handleChange('currentAddressLine1')}
        error={errors?.currentAddressLine1}
        placeholder="House / Flat / Door no."
        autoComplete="address-line1"
        data-cy="step4-addr-line1"
      />

      <Input
        label="Address Line 2 (optional)"
        value={currentAddressLine2}
        onChange={handleChange('currentAddressLine2')}
        placeholder="Street / Locality / Landmark"
        autoComplete="address-line2"
        data-cy="step4-addr-line2"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Input
            label="PIN Code"
            value={pinCode}
            onChange={handlePinChange}
            error={errors?.pinCode || pinLookup.error}
            placeholder="6-digit PIN"
            autoComplete="postal-code"
            data-cy="step4-pincode"
          />
          {pinLookup.isLoading && <p className="text-xs text-primary mt-1">Looking up...</p>}
        </div>
        <Input
          label="City"
          value={pinLookup.city || city}
          onChange={(e) => {
            userEdited.current.city = true;
            handleChange('city')(e);
          }}
          error={errors?.city}
          placeholder="City / Town"
          autoComplete="address-level2"
          data-cy="step4-city"
        />
        <Input
          label="State"
          value={pinLookup.state || state}
          onChange={(e) => {
            userEdited.current.state = true;
            handleChange('state')(e);
          }}
          error={errors?.state}
          placeholder="State"
          autoComplete="address-level1"
          data-cy="step4-state"
        />
      </div>

      <RadioGroup
        label="Residence Type"
        name="residenceType"
        options={RESIDENCE_TYPES}
        value={residenceType}
        onChange={handleChange('residenceType')}
        layout="horizontal"
        error={errors?.residenceType}
        data-cy="step4-residence-type"
      />

      {isRented && (
        <Input
          label="Monthly Rent Amount"
          value={rentAmount}
          onChange={handleChange('rentAmount')}
          error={errors?.rentAmount}
          placeholder="Enter monthly rent"
          data-cy="step4-rent-amount"
        />
      )}

      <Input
        label="Years at Current Address"
        value={yearsAtAddress}
        onChange={handleChange('yearsAtAddress')}
        error={errors?.yearsAtAddress}
        placeholder="Number of years (0-50)"
        inputMode="numeric"
        data-cy="step4-years-addr"
      />

      {showPreviousAddress && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Previous Address</h4>
          <Input
            label="Previous Address Line 1"
            value={previousAddressLine1}
            onChange={handleChange('previousAddressLine1')}
            error={errors?.previousAddressLine1}
            placeholder="Previous house / flat no."
            data-cy="step4-prev-addr-line1"
          />
          <Input
            label="Previous Address Line 2 (optional)"
            value={previousAddressLine2}
            onChange={handleChange('previousAddressLine2')}
            placeholder="Previous street / locality"
            data-cy="step4-prev-addr-line2"
          />
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Permanent Address</h3>

        <Checkbox
          label="Same as Current Address"
          checked={isSameAsPermanent}
          onChange={handleChange('isSameAsPermanent')}
          data-cy="step4-same-permanent"
        />

        {!isSameAsPermanent && (
          <div className="mt-4">
            <Input
              label="Permanent Address Line 1"
              value={permanentAddressLine1}
              onChange={handleChange('permanentAddressLine1')}
              error={errors?.permanentAddressLine1}
              placeholder="Permanent house / flat no."
              data-cy="step4-perm-addr-line1"
            />
            <Input
              label="Permanent Address Line 2 (optional)"
              value={permanentAddressLine2}
              onChange={handleChange('permanentAddressLine2')}
              placeholder="Permanent street / locality"
              data-cy="step4-perm-addr-line2"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  label="PIN Code"
                  value={permanentPinCode}
                  onChange={handlePermanentPinChange}
                  error={errors?.permanentPinCode || permanentPinLookup.error}
                  placeholder="6-digit PIN"
                  autoComplete="postal-code"
                  data-cy="step4-perm-pincode"
                />
                {permanentPinLookup.isLoading && <p className="text-xs text-primary mt-1">Looking up...</p>}
              </div>
              <Input
                label="City"
                value={permanentPinLookup.city || permanentCity}
                onChange={(e) => {
                  userEdited.current.permCity = true;
                  handleChange('permanentCity')(e);
                }}
                error={errors?.permanentCity}
                placeholder="City"
                autoComplete="address-level2"
                data-cy="step4-perm-city"
              />
              <Input
                label="State"
                value={permanentPinLookup.state || permanentState}
                onChange={(e) => {
                  userEdited.current.permState = true;
                  handleChange('permanentState')(e);
                }}
                error={errors?.permanentState}
                placeholder="State"
                autoComplete="address-level1"
                data-cy="step4-perm-state"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

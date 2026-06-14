import { useCallback, useEffect, useRef } from 'react';
import Input from './common/Input';
import RadioGroup from './common/RadioGroup';
import Checkbox from './common/Checkbox';
import usePinCodeLookup from '../hooks/usePinCodeLookup';
import { RESIDENCE_TYPES } from '../constants';

export default function Step4Address({ watch, setValue, errors }) {
  const currentAddressLine1 = watch('currentAddressLine1');
  const currentAddressLine2 = watch('currentAddressLine2');
  const pinCode = watch('pinCode');
  const city = watch('city');
  const state = watch('state');
  const residenceType = watch('residenceType');
  const rentAmount = watch('rentAmount');
  const yearsAtAddress = watch('yearsAtAddress');
  const previousAddressLine1 = watch('previousAddressLine1');
  const previousAddressLine2 = watch('previousAddressLine2');
  const isSameAsPermanent = watch('isSameAsPermanent');
  const permanentAddressLine1 = watch('permanentAddressLine1');
  const permanentAddressLine2 = watch('permanentAddressLine2');
  const permanentPinCode = watch('permanentPinCode');
  const permanentCity = watch('permanentCity');
  const permanentState = watch('permanentState');

  const pinLookup = usePinCodeLookup(pinCode);
  const permanentPinLookup = usePinCodeLookup(permanentPinCode);
  const isRented = residenceType === 'Rented';
  const showPreviousAddress = Number(yearsAtAddress) < 1 && yearsAtAddress !== '';

  const userEdited = useRef({ city: false, state: false, permCity: false, permState: false });

  useEffect(() => {
    if (pinLookup.city && pinLookup.state && !userEdited.current.city && !userEdited.current.state) {
      setValue('city', pinLookup.city);
      setValue('state', pinLookup.state);
    }
  }, [pinLookup.city, pinLookup.state, setValue]);

  useEffect(() => {
    if (permanentPinLookup.city && permanentPinLookup.state && !userEdited.current.permCity && !userEdited.current.permState) {
      setValue('permanentCity', permanentPinLookup.city);
      setValue('permanentState', permanentPinLookup.state);
    }
  }, [permanentPinLookup.city, permanentPinLookup.state, setValue]);

  const handleChange = useCallback((field) => (e) => {
    const value = e.target?.type === 'checkbox' ? e.target.checked : e.target?.value !== undefined ? e.target.value : e;

    if (field === 'city') userEdited.current.city = true;
    if (field === 'state') userEdited.current.state = true;
    if (field === 'permanentCity') userEdited.current.permCity = true;
    if (field === 'permanentState') userEdited.current.permState = true;

    if (field === 'isSameAsPermanent' && value) {
      setValue('permanentAddressLine1', currentAddressLine1 || '');
      setValue('permanentAddressLine2', currentAddressLine2 || '');
      setValue('permanentPinCode', pinCode || '');
      setValue('permanentCity', city || '');
      setValue('permanentState', state || '');
    }

    setValue(field, value);
  }, [setValue, currentAddressLine1, currentAddressLine2, pinCode, city, state]);

  const handlePinChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    userEdited.current.city = false;
    userEdited.current.state = false;
    setValue('pinCode', value);
  }, [setValue]);

  const handlePermanentPinChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    userEdited.current.permCity = false;
    userEdited.current.permState = false;
    setValue('permanentPinCode', value);
  }, [setValue]);

  const err = (f) => errors[f]?.message;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Address Information</h2>

      <h3 className="text-lg font-medium text-gray-700 mb-3">Current Address</h3>

      <Input
        label="Address Line 1"
        value={currentAddressLine1}
        onChange={handleChange('currentAddressLine1')}
        error={err('currentAddressLine1')}
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
            error={err('pinCode') || pinLookup.error}
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
          error={err('city')}
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
          error={err('state')}
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
        error={err('residenceType')}
        data-cy="step4-residence-type"
      />

      {isRented && (
        <Input
          label="Monthly Rent Amount"
          value={rentAmount}
          onChange={handleChange('rentAmount')}
          error={err('rentAmount')}
          placeholder="Enter monthly rent"
          data-cy="step4-rent-amount"
        />
      )}

      <Input
        label="Years at Current Address"
        value={yearsAtAddress}
        onChange={handleChange('yearsAtAddress')}
        error={err('yearsAtAddress')}
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
            error={err('previousAddressLine1')}
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
              error={err('permanentAddressLine1')}
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
                  error={err('permanentPinCode') || permanentPinLookup.error}
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
                error={err('permanentCity')}
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
                error={err('permanentState')}
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

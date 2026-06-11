export default function Step3KYC({ formData, updateFields, errors }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Identity Verification (KYC)</h2>
      <p className="text-gray-500">Verify your identity with PAN, Aadhaar, and optional documents.</p>
    </div>
  );
}

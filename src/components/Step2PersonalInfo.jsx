export default function Step2PersonalInfo({ formData, updateFields, errors }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Personal Information</h2>
      <p className="text-gray-500">Provide your personal details including name, DOB, and contact info.</p>
    </div>
  );
}

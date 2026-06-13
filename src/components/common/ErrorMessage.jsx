export default function ErrorMessage({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" aria-live="polite" className="mt-1 text-sm text-error">
      {message}
    </p>
  );
}

export default function SubmissionHoneypot({ inputRef }) {
  return (
    <div hidden>
      <label>
        Leave this field empty
        <input autoComplete="off" name="website" ref={inputRef} tabIndex={-1} type="text" />
      </label>
    </div>
  );
}

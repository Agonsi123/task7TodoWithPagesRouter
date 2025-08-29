/**
 * Converts a Firestore Timestamp object (or its serialized form) or a Date-like value
 * into a valid JavaScript Date object.
 *
 * {any} timestampValue The value to convert. Can be a Date, a Firebase Timestamp object,
 *                             an object like { seconds, nanoseconds }, a date string, or a number.
 * {Date | null} A JavaScript Date object, or null if conversion fails or input is invalid.
 */
export function convertFirestoreTimestampToDate(timestampValue) {
  // Return null immediately for falsy values
  if (!timestampValue) {
    return null;
  }

  // Scenario 1: It's already a native JavaScript Date object
  if (timestampValue instanceof Date) {
    return timestampValue;
  }

  // Scenario 2: It's a plain JavaScript object with 'seconds' and 'nanoseconds' properties
  // (This is how Firestore Timestamps often serialize over HTTP).
  if (
    typeof timestampValue === "object" &&
    timestampValue.seconds !== undefined &&
    typeof timestampValue.seconds === "number"
  ) {
    return new Date(timestampValue.seconds * 1000); // Convert seconds (Unix timestamp) to milliseconds
  }

  // --- NEW SCENARIO: Handling the {_seconds, _nanoseconds} format ---
  if (
    typeof timestampValue === "object" &&
    timestampValue._seconds !== undefined &&
    typeof timestampValue._seconds === "number"
  ) {
    return new Date(timestampValue._seconds * 1000);
  }

  // Scenario 3: It's a string that `Date` constructor can parse (e.g., ISO 8601 string)
  if (typeof timestampValue === "string") {
    const date = new Date(timestampValue);
    if (!isNaN(date.getTime())) {
      // Check if the parsed date is valid
      return date;
    }
  }

  // Scenario 4: It's a number (e.g., Unix timestamp in milliseconds)
  if (typeof timestampValue === "number") {
    const date = new Date(timestampValue);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // If none of the above matches, it's an unknown or unparsable format
  return null;
}

# Security Specification for Firestore Security Rules

## 1. Data Invariants
- A user can only access, create, update, or delete their own habits, exercise logs, language logs, global stats, and routine settings. No user is permitted to read or write other users' data.
- Document IDs for habits, logs, stats, and settings must be valid IDs of correct format and length.
- Input values must be validated for types and maximum lengths/ranges (e.g. habit names, intensities, etc.).
- All timestamps must match or be derived from server time where appropriate.

## 2. The "Dirty Dozen" Payloads (Designed to break laws of Identity, Integrity, and State)
1. **Malicious Habit Creation for another user**: Attempting to insert a habit with `userId = "bob"` when signed in as `alice`.
2. **Junk character ID injection**: Creating a habit with an extremely long ID containing malicious characters (e.g., `../abc/def` or `12345678...`).
3. **Ghost Field in Habit update**: Injecting an unauthorized field `isAdmin: true` during a habit update.
4. **Invalid Exercise Log type**: Attempting to write an exercise log with `type = "SpaceWalking"` which is not in the allowed enum.
5. **Excessively long note in Exercise Log**: Logging a workout with a `notes` field exceeding 1000 characters.
6. **Self-assigned high progress level**: Creating language progress or hours with an extremely high invalid float value.
7. **Malicious write to other user stats**: Signed in as `alice`, attempting to change `bob`'s streak count or water amount.
8. **Invalid timestamp**: Submitting client-provided fake timestamp for `createdAt` instead of using the server timestamp.
9. **Settings hijack**: Signed in as `alice`, attempting to retrieve or modify `bob`'s routine settings.
10. **Shadow update of stats**: Attempting to overwrite stats with a payload missing required fields like `streak`.
11. **Negative water amount registration**: Submitting a stats update with a negative value for `waterAmount`.
12. **Malicious bulk deletion**: Attempting to query/delete another user's entire collection of habits.

## 3. Test Runner Specification
These test cases are designed to be run in a sandbox test suite or security simulation.
All "Dirty Dozen" payloads must trigger a `PERMISSION_DENIED` response from the rules engine.
- `assertFails(aliceDb.collection('users').doc('bob').set({...}))`
- `assertFails(aliceDb.collection('users').doc('alice').collection('habits').doc('long_poison_id_...').set({...}))`
- `assertFails(aliceDb.collection('users').doc('alice').collection('habits').doc('1').update({ ghostField: true }))`

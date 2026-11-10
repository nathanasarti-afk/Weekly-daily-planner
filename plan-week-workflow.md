# /plan-week workflow

The Claude skill that rebuilds the planner each week. This is a public, generic version: team names, people, email senders and gyms are placeholders.

Needs connectors: Gmail, Google Drive, Google Calendar.

## 1. Pick the week

Weeks run Monday to Sunday. If a date is given (`/plan-week Nov 16`), use the week containing it. Otherwise: Fri–Sun → next Monday; Mon–Thu → this Monday.

## 2. Team A practices (Gmail, TeamSnap)

The head coach sends a weekly TeamSnap "Schedule for the week" email, usually the Sunday before.

- Search with `includeTrash: true` (these often get trashed).
- If `get_thread` fails on trashed mail, use `get_message`.
- Single-event emails ("New event", "Updated", "Canceled") override the weekly email.
- Practices and skills training only. Games, scrimmages and team events are skipped but listed in the summary.
- No weekly email yet → fall back to the team's events on Google Calendar and say so.

## 3. Team B practices (Google Drive sheet)

Read the newest `Team Schedule<M.D>.xlsx`. One block per week: a header row with the seven dates (Mon..Sun), then a row per age group. Cells look like `4:00-5:00pm Gym 1` or `5:00-7:00pm prac/lift Gym 1`. Columns are spaced, so map each time to its date column carefully. If the week has no block, say so; never invent times.

## 4. Rules

1. **Practice times only, never lifting.** For a `prac/lift` cell, use the practice split from last week's matching calendar event ("Practice portion only…"); if there is none, ask.
2. **Separate blocks.** Team A → `kind: 'varsity'`, Team B → `kind: 'storm'` (these are the page's two colour styles).
3. **Training** is Tue–Thu 9–10am. Reset `TRAINING_EXCEPTIONS` to `{}` each week unless asked to move one.
4. **Lights out 11pm** nightly (built into the page).
5. **Overlaps are fine.** Don't move or warn about them.
6. **Cleaning** is an optional 10-min block, done by 3pm, 30 min from anything else. The page places it; skipped days are expected.
7. When calendar and sheet disagree, the more recently edited one wins; mention the difference.

## 5. Update the planner

Edit only the `SAMPLE` array, the `SAMPLE.push(...)` Team B block, `TRAINING_EXCEPTIONS`, the source comments, and the `Week of <Mon D>` tag. Republish to the same link. Don't touch the CSS, targets or planning logic. Optionally render with Playwright to check for page errors.

## 6. Sync to Google Calendar

1. `node extract_blocks.js planner.html <monday YYYY-MM-DD>` → JSON of every block on the grid, with real dates.
2. Delete only earlier events whose description contains `[plan-week]` for that week. Never touch other events.
3. Create one event per block, `notificationLevel: NONE`, description starting `[plan-week] <source>`.

   | group | colour | reminders |
   |---|---|---|
   | varsity (Team A) | 11 red | default |
   | storm (Team B) | 7 teal | default |
   | training | 10 green | default |
   | other-fixed | 8 gray | default |
   | planned (workout, film, content) | 1 lavender | none |
   | planned, Clean (optional) | 1 lavender | none, shown as free |
   | lightsout | 8 gray | popup 30 min before, shown as free |

4. Send creates in parallel batches, then count the `[plan-week]` events to confirm.

## 7. Report back

The week, a table of practices added with their sources, skipped non-practice events, calendar events created/replaced, anything reconciled. Link the planner.

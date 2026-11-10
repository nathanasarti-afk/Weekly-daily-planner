# Weekly day planner

An automated weekly planner built with Claude for my Pairing Mind AI course sprint project. It takes the fixed parts of my week (team practices, training) and fits everything else I want to get done around them: workouts, film review, cleaning, content, and lights out at 11pm.

> The schedule in this repo is **sample data**. Real practice times, people and locations are kept out of the public repo.

## How it works

1. **Inputs.** Each week Claude pulls team practice times from a coach's TeamSnap email (Gmail) and a team schedule spreadsheet (Google Drive), plus my standing commitments.
2. **Planner page** (`index.html`). The fixed commitments go in, and the page places the weekly targets into the open time:

   | Block | Target |
   |---|---|
   | Workouts | 3–4 × 60 min |
   | Film review | 2–3 hours |
   | Content | 1 block |
   | Cleaning (optional) | 10 min daily, done by 3pm, 30 min clear of other blocks |
   | Lights out | 11pm every night |

   A "Plan vs. targets" table shows what was met, and you can add a commitment and the week re-plans around it.
3. **Calendar sync** (`extract_blocks.js`). Renders the page, reads every block off the grid with real dates, and outputs JSON that Claude writes to Google Calendar. Every event is tagged `[plan-week]` so reruns only replace their own events.
4. **Workflow** (`plan-week-workflow.md`). The step-by-step rules Claude follows when I type `/plan-week`.

## Files

| File | What it is |
|---|---|
| `index.html` | The planner page. Open it in a browser; no build step. |
| `extract_blocks.js` | Node + Playwright script: `node extract_blocks.js index.html 2026-11-09` |
| `plan-week-workflow.md` | The weekly `/plan-week` routine (generic version) |

## Rules the planner follows

- Practice times only; lifting/weights never get added.
- Overlapping commitments are left alone to clean up by hand.
- Blocks are placed between 8am and lights out.
- Film review goes first, then workouts, then content, then cleaning.

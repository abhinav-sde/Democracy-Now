# Content format

Every weekend rundown is a script the host can read and a producer can time. It is not a news article and it is not a prediction.

## The card

Each weekend in `show/rundowns/` uses the same fields. The blank is [rundown-template.md](rundown-template.md).

| Field | What goes in it |
| --- | --- |
| Weekend | The Saturday, then the Sunday air date. |
| Runtime | 90 or 120. |
| Status | `archive plan` if the Sunday is already past 30 September 2026. `on the board` if it is still ahead. `conditional` if the show depends on a first-round rule. |
| Cold open | Four to six sentences that can be spoken. Office, country, date. |
| On the desk | The 14-day list. One line per election. |
| The ballot | Who chooses, what they choose, the term, the winning rule. |
| How this government works | One mechanism, then one comparison. |
| The other chair | The second subject. India, the United States, or another country that week. |
| What we will not say | The bans for this episode, written as lines the host reads. |
| Watch next | The next Sunday, and the next confirmed date. |

A 120-minute card adds **Third chair** and **The month ahead**.

## Confidence, said on air

The correspondent uses one of these words and no other.

| Word | Meaning |
| --- | --- |
| Confirmed | A commission, a parliament, or the government that calls the election has set the day. |
| Tentative | The day is published and the same sources still mark it as not firm. Guinea-Bissau on 6 December 2026 and South Sudan on 22 December 2026 are tentative on this desk. |
| Preliminary | A commission has circulated a calendar and said it is not the final decree. Guatemala’s 27 June and 22 August 2027 are preliminary. |
| Undated | The election is due in that year. Nobody has set the day. “February or March” from a newspaper is not a day. |
| Indirect | An assembly or a college votes. The public does not. |
| Conditional | The day exists in law only if the first round fails to produce a winner. |

If the international calendar and the national commission disagree, the show follows the commission and says that the calendar is behind.

## Language that can be spoken

Write sentences a person can say in one breath.

- “Voters in Brazil choose a president on 4 October. A winner needs more than half the valid votes. If nobody has that, the top two meet on 25 October. That second Sunday is not on our calendar until it is required.”
- “The Gambia elects a president in December and a parliament in April. Those are two offices and two days.”
- “Germany’s president is chosen on 30 January by the Federal Convention. There is no popular vote that day.”

Do not write: “a key test for democracy,” “a watershed,” “freest and fairest,” “the international community,” or a sentence that names who will win.

## What a structure explanation must contain

For every election in [../elections](../elections), the explanation has four lines and no more than those four jobs:

1. **Office.** The name of the body or the person being chosen.
2. **Chooser.** The public, an assembly, an electoral college, or a mix.
3. **Term.** How long, and whether the whole body is renewed or only a class of seats.
4. **Rule.** What finishes the election: most votes, a majority, a share in a set of states, a second round, or a vote inside a chamber.

If any of the four is not in a source this book cites, the line says “not stated here” rather than a guess. Seat counts are included only where this book already has them.

## India and the United States are not footnotes

They are standing chairs.

- An Indian assembly election is **The other chair** whenever one is inside the month, and **The ballot** on the weekend of the vote.
- The United States midterm is a three-show arc: the preview on 1 November 2026, the desk on 8 November 2026, and the “what a midterm does not elect” lesson any quiet Sunday in October can carry.
- In 2027 the Indian presidential vote is indirect. The state assemblies that are due have no Election Commission schedule in this book. They are planned as undated, with the term-expiry window, not as a fake poll day.

## Second rounds

Write two cold opens when the law says the second round might not happen.

- **Open A.** Nobody won the first round. The second round is today. Name the offices. Do not name the candidates unless they are already in the file as the rule’s “top two,” and this book does not name them.
- **Open B.** Someone cleared the first-round rule, or the round was not required. Today’s show is what a finished first round means, plus the other country that is actually voting.

Brazil on 25 October 2026, the Czech Senate on 16–17 October 2026, France on 2 May 2027, and Guatemala on 22 August 2027 are conditional. France’s second date is published by the government and still does not happen if a candidate wins a majority on 18 April.

## Archive plans

Any Sunday before 30 September 2026 is marked archive plan. The card describes the show as it should have been built from the calendar. It does not add a winner that the website does not have. The Indian assemblies of April 2026 stay “result not recorded.”

## Regime

A coup, a restoration, a suspension, or a transition is a block only when the website repository's `public/data/regime-events.json` has a date and a source. That file is empty. No weekend in this book invents one. If a sourced event is added later, it replaces **What we will not say** for that Sunday and is read in five minutes: what happened, the date, the source. It does not become the whole show.

## From this book to the website

The website brief is still the four headings in `episodes/_template.md`. A Sunday show that should also be the page on the site is cut down to those four headings after the broadcast, not the other way around. New episode files still have to be listed in the website repository's `public/content/manifest.json`. Copy `episodes` and `structures` into that site's `public/content` folder when the brief is ready to publish.

This book is allowed to mention elections that are not yet rows in the website's `public/data/elections.json` — Serbia and Bulgaria in October 2026, the whole of the 2027 calendar — because it is the planning book. Moving a row onto the website is a separate edit, with the same source.

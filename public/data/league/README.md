# League VOD assignments (`vods.json`)

`vods.json` controls which Twitch VOD plays on the site:

- **Division page → "Last Played" player** — plays the VOD of the most recently
  completed match day for that division.
- **Match day results page → "Match VOD" player** — plays the VOD assigned to
  that specific week / finals for that division.

## Structure

```json
{
  "<Season>": {
    "<division number 1-8>": {
      "week1": "<Twitch VOD link>",
      ...
      "week6": "<Twitch VOD link>",
      "finals": "<Twitch VOD link>"
    }
  }
}
```

## How to set or change a VOD

1. Find the VOD on Twitch (channel page → **Videos**) and copy its link.
   Accepted formats:
   - `https://www.twitch.tv/videos/2799221116`
   - `https://www.twitch.tv/videos/2799221116?t=1h2m3s` (starts playback at that timestamp)
   - a bare video ID like `2799221116`
2. Paste it into the matching season → division → match-day slot in `vods.json`.
3. Commit and deploy. The file is fetched at runtime, so no code change is needed.

To remove a VOD, delete that key (or the whole division block). Pages fall back
gracefully: the match page shows a "VOD coming soon" note, and the division
"Last Played" player falls back to the division's live channel.

> **Before launch:** the current entries are sample data — real Season 14
> Division 2 VODs from `twitch.tv/virida3` copied across every division.
> Admins must replace each division's entries with that division's own VODs.
> Note that Twitch VODs expire (typically 14–60 days depending on the
> broadcaster's status), so links should be set soon after each match day, or
> use Highlights, which don't expire.
